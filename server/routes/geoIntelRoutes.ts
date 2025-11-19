import express from "express";
import type { IStorage } from "../storage.js";
import { geocodeAddress, findNearbyEmergencyServices } from "../services/geocoding.js";
import { parseCAPIndexPDF, createManualCrimeEntry } from "../services/crimeData.js";
import { searchFBIAgencies, getFBIAgencyCrimeData, convertFBIStatsToOurFormat } from "../services/fbiCrimeData.js";
import multer from "multer";
import { z } from "zod";
import { parse } from "csv-parse/sync";

const upload = multer({ storage: multer.memoryStorage() });

export function registerGeoIntelRoutes(app: express.Application, storage: IStorage) {
  // ===================================================================
  // GEOCODING ROUTES
  // ===================================================================

  // Geocode a specific site
  app.post("/api/sites/:siteId/geocode", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId } = req.params;
      const site = await storage.getSite(siteId);

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Verify ownership: user owns site OR user is in same organization
      const user = await storage.getUser(userId);
      const hasAccess = site.userId === userId || 
                       (user && user.organizationId && site.organizationId === user.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Build address string
      const addressParts = [
        site.address,
        site.city,
        site.state,
        site.zipCode,
        site.country || "USA"
      ].filter(Boolean);

      if (addressParts.length === 0) {
        return res.status(400).json({ error: "Site has no address information" });
      }

      const fullAddress = addressParts.join(", ");

      // Geocode the address
      const geocoded = await geocodeAddress(fullAddress);

      // Update site with geocoded data
      await storage.updateSite(siteId, {
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        normalizedAddress: geocoded.normalizedAddress,
        geocodeProvider: "google_maps",
        geocodeStatus: "success",
        geocodeTimestamp: new Date(),
        county: geocoded.county,
      });

      res.json({
        success: true,
        data: geocoded,
      });
    } catch (error: any) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: error.message || "Failed to geocode address" });
    }
  });

  // Manual coordinate entry
  app.post("/api/sites/:siteId/coordinates", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId } = req.params;
      const { latitude, longitude } = req.body;

      const site = await storage.getSite(siteId);

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Verify ownership: user owns site OR user is in same organization
      const user = await storage.getUser(userId);
      const hasAccess = site.userId === userId || 
                       (user && user.organizationId && site.organizationId === user.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Validate coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // Update site
      await storage.updateSite(siteId, {
        latitude: lat.toString(),
        longitude: lng.toString(),
        geocodeProvider: "manual",
        geocodeStatus: "success",
        geocodeTimestamp: new Date(),
      });

      res.json({
        success: true,
        data: {
          latitude: lat.toString(),
          longitude: lng.toString(),
        },
      });
    } catch (error: any) {
      console.error("Coordinate update error:", error);
      res.status(500).json({ error: error.message || "Failed to update coordinates" });
    }
  });

  // ===================================================================
  // PROXIMITY ANALYSIS ROUTES
  // ===================================================================

  // Find nearby emergency services for a site
  app.get("/api/sites/:siteId/proximity", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId } = req.params;
      const radiusMiles = parseInt(req.query.radius as string) || 10;

      const site = await storage.getSite(siteId);

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Verify ownership: user owns site OR user is in same organization
      const user = await storage.getUser(userId);
      const hasAccess = site.userId === userId || 
                       (user && user.organizationId && site.organizationId === user.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!site.latitude || !site.longitude) {
        return res.status(400).json({ error: "Site does not have coordinates. Please geocode first." });
      }

      // Find nearby services
      const services = await findNearbyEmergencyServices(
        parseFloat(site.latitude),
        parseFloat(site.longitude),
        radiusMiles
      );

      // Get existing POIs for deduplication
      const existingPOIs = await storage.getPointsOfInterest(siteId, undefined);

      // Auto-save POIs to database with deduplication
      for (const service of services) {
        // Check if POI already exists with same type, name, and siteId
        const duplicate = existingPOIs.find(
          poi => poi.poiType === service.type && 
                 poi.name === service.name && 
                 poi.siteId === siteId
        );

        if (!duplicate) {
          await storage.createPointOfInterest({
            siteId: siteId,
            poiType: service.type,
            name: service.name,
            address: service.address,
            latitude: service.latitude,
            longitude: service.longitude,
            distanceToSite: service.distance,
            phoneNumber: service.phoneNumber,
            isActive: true,
          });
        }
      }

      res.json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      console.error("Proximity analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to perform proximity analysis" });
    }
  });

  // ===================================================================
  // POINTS OF INTEREST ROUTES
  // ===================================================================

  // Get POIs for a site or assessment
  app.get("/api/points-of-interest", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId, assessmentId } = req.query;

      // Verify ownership if siteId or assessmentId is provided
      if (siteId) {
        const site = await storage.getSite(siteId as string);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (assessmentId) {
        const assessment = await storage.getAssessment(assessmentId as string);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const pois = await storage.getPointsOfInterest(
        siteId as string | undefined,
        assessmentId as string | undefined
      );

      res.json(pois);
    } catch (error: any) {
      console.error("Get POIs error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch POIs" });
    }
  });

  // Create custom POI
  app.post("/api/points-of-interest", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Validate request body
      const poiSchema = z.object({
        siteId: z.string().optional(),
        assessmentId: z.string().optional(),
        poiType: z.string(),
        name: z.string(),
        address: z.string().optional(),
        latitude: z.string(),
        longitude: z.string(),
        distanceToSite: z.string().optional(),
        phoneNumber: z.string().optional(),
        isActive: z.boolean().optional(),
      });

      const validatedData = poiSchema.parse(req.body);

      // Verify ownership if siteId or assessmentId is provided
      if (validatedData.siteId) {
        const site = await storage.getSite(validatedData.siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (validatedData.assessmentId) {
        const assessment = await storage.getAssessment(validatedData.assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const poi = await storage.createPointOfInterest(validatedData);
      res.status(201).json(poi);
    } catch (error: any) {
      console.error("Create POI error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create POI" });
    }
  });

  // Update POI
  app.put("/api/points-of-interest/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;

      // Get existing POI to verify ownership
      const existingPOIs = await storage.getPointsOfInterest(undefined, undefined);
      const existingPOI = existingPOIs.find(p => p.id === id);

      if (!existingPOI) {
        return res.status(404).json({ error: "POI not found" });
      }

      // Verify ownership via site or assessment
      if (existingPOI.siteId) {
        const site = await storage.getSite(existingPOI.siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (existingPOI.assessmentId) {
        const assessment = await storage.getAssessment(existingPOI.assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const poi = await storage.updatePointOfInterest(id, req.body);
      res.json(poi);
    } catch (error: any) {
      console.error("Update POI error:", error);
      res.status(500).json({ error: error.message || "Failed to update POI" });
    }
  });

  // Delete POI
  app.delete("/api/points-of-interest/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;

      // Get existing POI to verify ownership
      const existingPOIs = await storage.getPointsOfInterest(undefined, undefined);
      const existingPOI = existingPOIs.find(p => p.id === id);

      if (!existingPOI) {
        return res.status(404).json({ error: "POI not found" });
      }

      // Verify ownership via site or assessment
      if (existingPOI.siteId) {
        const site = await storage.getSite(existingPOI.siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (existingPOI.assessmentId) {
        const assessment = await storage.getAssessment(existingPOI.assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      await storage.deletePointOfInterest(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete POI error:", error);
      res.status(500).json({ error: error.message || "Failed to delete POI" });
    }
  });

  // ===================================================================
  // CRIME DATA ROUTES
  // ===================================================================

  // Get crime sources for a site or assessment
  app.get("/api/crime-sources", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId, assessmentId } = req.query;

      // Verify ownership if siteId or assessmentId is provided
      if (siteId) {
        const site = await storage.getSite(siteId as string);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (assessmentId) {
        const assessment = await storage.getAssessment(assessmentId as string);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const sources = await storage.getCrimeSources(
        siteId as string | undefined,
        assessmentId as string | undefined
      );

      res.json(sources);
    } catch (error: any) {
      console.error("Get crime sources error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch crime sources" });
    }
  });

  // Import crime data from CAP Index PDF
  app.post("/api/crime-data/import-pdf", upload.single("file"), async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate request body
      const importSchema = z.object({
        siteId: z.string().optional(),
        assessmentId: z.string().optional(),
        dataTimePeriod: z.string().optional(),
      });

      const validatedData = importSchema.parse(req.body);
      const { siteId, assessmentId, dataTimePeriod } = validatedData;

      // Verify ownership if siteId or assessmentId is provided
      if (siteId) {
        const site = await storage.getSite(siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (assessmentId) {
        const assessment = await storage.getAssessment(assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      // Parse PDF using AI
      const crimeData = await parseCAPIndexPDF(req.file.buffer);

      // Create crime source
      const crimeSource = await storage.createCrimeSource({
        siteId: siteId || null,
        assessmentId: assessmentId || null,
        dataSource: "pdf_import",
        dataTimePeriod: dataTimePeriod || crimeData.dataTimePeriod || "Unknown",
        city: crimeData.city,
        county: crimeData.county,
        state: crimeData.state,
        zipCodes: crimeData.zipCodes ? JSON.stringify(crimeData.zipCodes) : null,
        originalFileName: req.file.originalname,
        dataQuality: "estimated", // AI-extracted data
      });

      // Create crime observation
      const observation = await storage.createCrimeObservation({
        crimeSourceId: crimeSource.id,
        violentCrimes: JSON.stringify(crimeData.violentCrimes),
        propertyCrimes: JSON.stringify(crimeData.propertyCrimes),
        otherCrimes: crimeData.otherCrimes ? JSON.stringify(crimeData.otherCrimes) : null,
        overallCrimeIndex: crimeData.overallCrimeIndex || null,
        nationalAverage: crimeData.nationalAverage ? JSON.stringify(crimeData.nationalAverage) : null,
        stateAverage: crimeData.stateAverage ? JSON.stringify(crimeData.stateAverage) : null,
        comparisonRating: crimeData.comparisonRating || null,
        startDate: null,
        endDate: null,
      });

      res.status(201).json({
        success: true,
        crimeSource,
        observation,
      });
    } catch (error: any) {
      console.error("PDF import error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to import crime data from PDF" });
    }
  });

  // Manual crime data entry
  app.post("/api/crime-data/manual-entry", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Validate request body
      const manualEntrySchema = z.object({
        siteId: z.string().optional(),
        assessmentId: z.string().optional(),
        dataTimePeriod: z.string(),
        violentTotal: z.string().or(z.number()),
        propertyTotal: z.string().or(z.number()),
        population: z.string().or(z.number()),
        city: z.string().optional(),
        county: z.string().optional(),
        state: z.string().optional(),
      });

      const validatedData = manualEntrySchema.parse(req.body);
      const {
        siteId,
        assessmentId,
        dataTimePeriod,
        violentTotal,
        propertyTotal,
        population,
        city,
        county,
        state,
      } = validatedData;

      // Verify ownership if siteId or assessmentId is provided
      if (siteId) {
        const site = await storage.getSite(siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (assessmentId) {
        const assessment = await storage.getAssessment(assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      // Create crime statistics object
      const crimeData = createManualCrimeEntry(
        parseInt(violentTotal.toString()),
        parseInt(propertyTotal.toString()),
        parseInt(population.toString()),
        {
          city,
          county,
          state,
          dataTimePeriod,
        }
      );

      // Create crime source
      const crimeSource = await storage.createCrimeSource({
        siteId: siteId || null,
        assessmentId: assessmentId || null,
        dataSource: "manual_entry",
        dataTimePeriod,
        city,
        county,
        state,
        dataQuality: "verified",
      });

      // Create crime observation
      const observation = await storage.createCrimeObservation({
        crimeSourceId: crimeSource.id,
        violentCrimes: JSON.stringify(crimeData.violentCrimes),
        propertyCrimes: JSON.stringify(crimeData.propertyCrimes),
        overallCrimeIndex: crimeData.overallCrimeIndex || null,
        comparisonRating: crimeData.comparisonRating || null,
        startDate: null,
        endDate: null,
      });

      res.status(201).json({
        success: true,
        crimeSource,
        observation,
      });
    } catch (error: any) {
      console.error("Manual entry error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create manual crime entry" });
    }
  });

  // ===================================================================
  // FBI CRIME DATA ROUTES
  // ===================================================================

  // Search FBI agencies by location
  app.get("/api/crime-data/fbi/agencies/search", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { state, city, county, limit } = req.query;

      const results = await searchFBIAgencies({
        state: state as string | undefined,
        city: city as string | undefined,
        county: county as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(results);
    } catch (error: any) {
      console.error("FBI agency search error:", error);
      res.status(500).json({ error: error.message || "Failed to search FBI agencies" });
    }
  });

  // Import crime data from FBI for a specific agency
  app.post("/api/crime-data/fbi/import", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const importSchema = z.object({
        ori: z.string(),
        siteId: z.string().optional(),
        assessmentId: z.string().optional(),
        year: z.number().optional(),
      });

      const validatedData = importSchema.parse(req.body);
      const { ori, siteId, assessmentId, year } = validatedData;

      // Verify ownership if siteId or assessmentId is provided
      if (siteId) {
        const site = await storage.getSite(siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (assessmentId) {
        const assessment = await storage.getAssessment(assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      // Fetch FBI crime data
      const fbiData = await getFBIAgencyCrimeData(ori);

      // Get the specified year or most recent
      const targetYear = year || fbiData.mostRecentYear;
      const yearStats = fbiData.stats.find(s => s.year === targetYear);

      if (!yearStats) {
        return res.status(404).json({ 
          error: `No crime data available for year ${targetYear}` 
        });
      }

      // Convert to our format
      const { violentTotal, propertyTotal, population, overallCrimeIndex } = 
        convertFBIStatsToOurFormat(yearStats, fbiData.agency);

      // Create crime data entry
      const crimeData = createManualCrimeEntry(
        violentTotal,
        propertyTotal,
        population,
        {
          city: fbiData.location.city,
          county: fbiData.location.county,
          state: fbiData.location.state,
          dataTimePeriod: targetYear.toString(),
        }
      );

      // Create crime source
      const crimeSource = await storage.createCrimeSource({
        siteId: siteId || null,
        assessmentId: assessmentId || null,
        dataSource: "fbi_ucr",
        dataTimePeriod: targetYear.toString(),
        city: fbiData.location.city || null,
        county: fbiData.location.county || null,
        state: fbiData.location.state || null,
        dataQuality: "verified",
      });

      // Create crime observation
      const observation = await storage.createCrimeObservation({
        crimeSourceId: crimeSource.id,
        violentCrimes: JSON.stringify(crimeData.violentCrimes),
        propertyCrimes: JSON.stringify(crimeData.propertyCrimes),
        overallCrimeIndex: crimeData.overallCrimeIndex || null,
        comparisonRating: crimeData.comparisonRating || null,
        startDate: null,
        endDate: null,
      });

      res.status(201).json({
        success: true,
        crimeSource,
        observation,
        agencyInfo: {
          name: fbiData.agency.agency_name,
          ori: fbiData.agency.ori,
          year: targetYear,
        },
      });
    } catch (error: any) {
      console.error("FBI crime data import error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to import FBI crime data" });
    }
  });

  // Get crime observations for a source
  app.get("/api/crime-sources/:sourceId/observations", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { sourceId } = req.params;

      // Get crime source to verify ownership
      const sources = await storage.getCrimeSources(undefined, undefined);
      const source = sources.find(s => s.id === sourceId);

      if (!source) {
        return res.status(404).json({ error: "Crime source not found" });
      }

      // Verify ownership via site or assessment
      if (source.siteId) {
        const site = await storage.getSite(source.siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (source.assessmentId) {
        const assessment = await storage.getAssessment(source.assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const observations = await storage.getCrimeObservationsBySource(sourceId);
      res.json(observations);
    } catch (error: any) {
      console.error("Get crime observations error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch crime observations" });
    }
  });

  // Delete crime source
  app.delete("/api/crime-sources/:sourceId", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { sourceId } = req.params;

      // Get crime source directly to verify ownership
      const source = await storage.getCrimeSource(sourceId);

      if (!source) {
        return res.status(404).json({ error: "Crime source not found" });
      }

      // Verify ownership via site or assessment
      if (source.siteId) {
        const site = await storage.getSite(source.siteId);
        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = site.userId === userId || 
                         (user && user.organizationId && site.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (source.assessmentId) {
        const assessment = await storage.getAssessment(source.assessmentId);
        if (!assessment) {
          return res.status(404).json({ error: "Assessment not found" });
        }

        const user = await storage.getUser(userId);
        const hasAccess = assessment.userId === userId || 
                         (user && user.organizationId && assessment.organizationId === user.organizationId);
        
        if (!hasAccess) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      await storage.deleteCrimeSource(sourceId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete crime source error:", error);
      res.status(500).json({ error: error.message || "Failed to delete crime source" });
    }
  });

  // ===================================================================
  // SITE INCIDENTS ROUTES
  // ===================================================================

  // Get all incidents for a site
  app.get("/api/sites/:siteId/incidents", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId } = req.params;
      const site = await storage.getSite(siteId);

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Verify ownership
      const user = await storage.getUser(userId);
      const hasAccess = site.userId === userId || 
                       (user && user.organizationId && site.organizationId === user.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const incidents = await storage.getSiteIncidents(siteId);
      res.json(incidents);
    } catch (error: any) {
      console.error("Get incidents error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch incidents" });
    }
  });

  // Import site incidents from CSV
  app.post("/api/sites/:siteId/incidents/import-csv", upload.single("file"), async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { siteId } = req.params;
      const site = await storage.getSite(siteId);

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Verify ownership
      const user = await storage.getUser(userId);
      const hasAccess = site.userId === userId || 
                       (user && user.organizationId && site.organizationId === user.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse CSV
      const csvContent = req.file.buffer.toString('utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (records.length === 0) {
        return res.status(400).json({ error: "CSV file is empty" });
      }

      // Validate and transform records
      const incidents = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          // Expected columns: Date, Type, Description, Severity, Location, Police Notified, Police Report #, Estimated Cost, Notes
          const incident = {
            siteId,
            incidentDate: new Date(record.Date || record.date),
            incidentType: (record.Type || record.type || 'other').toLowerCase(),
            description: record.Description || record.description || '',
            severity: (record.Severity || record.severity || 'medium').toLowerCase(),
            locationWithinSite: record.Location || record.location || null,
            policeNotified: (record['Police Notified'] || record.police_notified || 'no').toLowerCase() === 'yes',
            policeReportNumber: record['Police Report #'] || record.police_report_number || null,
            estimatedCost: record['Estimated Cost'] || record.estimated_cost 
              ? parseInt(String(record['Estimated Cost'] || record.estimated_cost).replace(/[^0-9]/g, '')) 
              : null,
            notes: record.Notes || record.notes || null,
          };

          // Validate required fields
          if (!incident.description) {
            errors.push(`Row ${i + 2}: Description is required`);
            continue;
          }

          if (isNaN(incident.incidentDate.getTime())) {
            errors.push(`Row ${i + 2}: Invalid date format`);
            continue;
          }

          incidents.push(incident);
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      if (errors.length > 0 && incidents.length === 0) {
        return res.status(400).json({ 
          error: "No valid incidents found", 
          details: errors 
        });
      }

      // Bulk insert incidents
      const created = await storage.bulkCreateSiteIncidents(incidents);

      res.json({
        success: true,
        imported: created.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      console.error("Import incidents error:", error);
      res.status(500).json({ error: error.message || "Failed to import incidents" });
    }
  });

  // Delete a site incident
  app.delete("/api/sites/incidents/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const incident = await storage.getSiteIncident(id);

      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }

      // Verify ownership via site
      const site = await storage.getSite(incident.siteId);
      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      const user = await storage.getUser(userId);
      const hasAccess = site.userId === userId || 
                       (user && user.organizationId && site.organizationId === user.organizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await storage.deleteSiteIncident(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete incident error:", error);
      res.status(500).json({ error: error.message || "Failed to delete incident" });
    }
  });
}
