import type { TableConfiguration, ColumnDefinition, RowHighlightConfig } from "../../types/report-recipe";
import type { ReportDataPackage } from "../../types/report-data";

export interface RenderedCell {
  value: string;
  bold?: boolean;
  color?: string;
  format?: string;
}

export interface RenderedRow {
  cells: RenderedCell[];
  highlighted?: boolean;
  highlightStyle?: 'bold' | 'highlight' | 'warning';
}

export interface RenderedTable {
  id: string;
  headers: { text: string; width: string }[];
  rows: RenderedRow[];
  footerRow?: RenderedRow;
  dataCount: number;
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  return value;
}

function formatCellValue(value: any, format?: ColumnDefinition['format']): string {
  if (value === undefined || value === null) return 'N/A';
  
  switch (format) {
    case 'date':
      if (typeof value === 'string' || value instanceof Date) {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      return String(value);
    
    case 'number':
      if (typeof value === 'number') {
        return value.toLocaleString('en-US');
      }
      return String(value);
    
    case 'multiplier':
      if (typeof value === 'number') {
        return `${value.toFixed(1)}x`;
      }
      return String(value);
    
    case 'percentage':
      if (typeof value === 'number') {
        return `${(value * 100).toFixed(0)}%`;
      }
      return String(value);
    
    case 'severity-badge':
      const severity = String(value).toLowerCase();
      const severityLabels: Record<string, string> = {
        critical: 'CRITICAL',
        high: 'HIGH',
        medium: 'MEDIUM',
        low: 'LOW'
      };
      return severityLabels[severity] || String(value).toUpperCase();
    
    case 'priority-badge':
      const priority = String(value).toLowerCase();
      const priorityLabels: Record<string, string> = {
        immediate: 'IMMEDIATE',
        'short-term': 'SHORT-TERM',
        'medium-term': 'MEDIUM-TERM',
        'long-term': 'LONG-TERM'
      };
      return priorityLabels[priority] || String(value).toUpperCase();
    
    case 'comma-list':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    
    case 'text':
    default:
      return String(value);
  }
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#CA8A04',
    low: '#16A34A'
  };
  return colors[severity?.toLowerCase()] || '#6B7280';
}

function checkRowHighlight(row: any, config: RowHighlightConfig): boolean {
  const value = getNestedValue(row, config.condition.field);
  
  switch (config.condition.operator) {
    case 'greaterThan':
      return typeof value === 'number' && value > config.condition.value;
    case 'lessThan':
      return typeof value === 'number' && value < config.condition.value;
    case 'equals':
      return value === config.condition.value;
    default:
      return false;
  }
}

export function renderTable(
  config: TableConfiguration, 
  data: ReportDataPackage
): RenderedTable {
  console.log(`[TableRenderer] Rendering table: ${config.id}`);
  
  const sourceData = getNestedValue(data, config.dataSource);
  
  if (!Array.isArray(sourceData)) {
    console.warn(`[TableRenderer] Data source '${config.dataSource}' is not an array or not found`);
    return {
      id: config.id,
      headers: config.columns.map(col => ({ text: col.header, width: col.width })),
      rows: [],
      dataCount: 0
    };
  }

  let sortedData = [...sourceData];
  if (config.sortBy) {
    sortedData.sort((a, b) => {
      const aVal = getNestedValue(a, config.sortBy!);
      const bVal = getNestedValue(b, config.sortBy!);
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return config.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      const strA = String(aVal);
      const strB = String(bVal);
      return config.sortOrder === 'desc' 
        ? strB.localeCompare(strA) 
        : strA.localeCompare(strB);
    });
  }

  const headers = config.columns.map(col => ({
    text: col.header,
    width: col.width
  }));

  const rows: RenderedRow[] = sortedData.map(rowData => {
    const cells: RenderedCell[] = config.columns.map(col => {
      const rawValue = getNestedValue(rowData, col.field);
      const formattedValue = formatCellValue(rawValue, col.format);
      
      const cell: RenderedCell = {
        value: formattedValue,
        bold: col.bold,
        format: col.format
      };

      if (col.format === 'severity-badge') {
        cell.color = getSeverityColor(String(rawValue));
      }
      
      return cell;
    });

    const row: RenderedRow = { cells };

    if (config.highlightRows) {
      if (checkRowHighlight(rowData, config.highlightRows)) {
        row.highlighted = true;
        row.highlightStyle = config.highlightRows.style;
      }
    }

    return row;
  });

  let footerRow: RenderedRow | undefined;
  if (config.footerRow) {
    footerRow = {
      cells: config.columns.map(col => ({
        value: config.footerRow![col.field] || '',
        bold: config.footerStyle === 'bold'
      }))
    };
  }

  console.log(`[TableRenderer] Rendered ${rows.length} rows for table ${config.id}`);

  return {
    id: config.id,
    headers,
    rows,
    footerRow,
    dataCount: rows.length
  };
}

export function renderMultipleTables(
  configs: TableConfiguration[],
  data: ReportDataPackage
): Map<string, RenderedTable> {
  const results = new Map<string, RenderedTable>();
  
  for (const config of configs) {
    const rendered = renderTable(config, data);
    results.set(config.id, rendered);
  }
  
  return results;
}
