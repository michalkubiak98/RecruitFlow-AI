import { Candidate } from '../types';
import { AppSettings } from '../types/settings';
import * as ExcelJS from 'exceljs';

export function exportToExcel(candidates: Candidate[], settings: AppSettings) {
  // Sort candidates by industry first, then by name
  const sortedCandidates = [...candidates].sort((a, b) => {
    // First sort by industry field if it exists
    const aIndustry = a.fields.industry || '';
    const bIndustry = b.fields.industry || '';
    if (aIndustry !== bIndustry) {
      if (aIndustry === 'life science' && bIndustry === 'food science') return -1;
      if (aIndustry === 'food science' && bIndustry === 'life science') return 1;
      if (aIndustry && !bIndustry) return -1;
      if (!aIndustry && bIndustry) return 1;
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${settings.appName} ${settings.entityName}`);

  // Set up columns with proper widths and headers
  const columns = [
    { header: 'Name', key: 'name', width: 20 },
    ...settings.fields.map(field => ({
      header: field.label,
      key: field.id,
      width: field.type === 'boolean' ? 10 : 20
    })),
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Date Added', key: 'createdAt', width: 12 },
    { header: 'Last Updated', key: 'updatedAt', width: 12 }
  ];

  worksheet.columns = columns;

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563EB' } // Blue header
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Add data rows with conditional formatting
  sortedCandidates.forEach((candidate) => {
    const rowData: any = {
      name: candidate.name,
      notes: candidate.notes || '',
      createdAt: new Date(candidate.createdAt).toLocaleDateString(),
      updatedAt: new Date(candidate.updatedAt).toLocaleDateString()
    };

    // Add dynamic field values
    settings.fields.forEach(field => {
      const value = candidate.fields[field.id];
      if (field.type === 'boolean') {
        rowData[field.id] = value ? 'Yes' : 'No';
      } else {
        rowData[field.id] = value || '';
      }
    });

    const row = worksheet.addRow(rowData);

    // Style based on industry
    const industryValue = candidate.fields.industry;
    if (industryValue === 'life science') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'EBF8FF' } // Light blue for life science
      };
    } else if (industryValue === 'food science') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0FDF4' } // Light green for food science
      };
    }

    // Style boolean fields
    settings.fields.forEach((field, index) => {
      if (field.type === 'boolean') {
        const cell = row.getCell(index + 2); // +2 because name is first, then fields start
        if (candidate.fields[field.id]) {
          cell.font = { color: { argb: '059669' }, bold: true }; // Green for Yes/True
        } else {
          cell.font = { color: { argb: 'DC2626' } }; // Red for No/False
        }
      }
    });

    // Add borders to all cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  // Add auto filter
  worksheet.autoFilter = {
    from: 'A1',
    to: `${String.fromCharCode(65 + columns.length - 1)}${sortedCandidates.length + 1}`
  };

  // Freeze the header row
  worksheet.views = [
    { state: 'frozen', ySplit: 1 }
  ];

  // Add summary information
  const summaryStartRow = sortedCandidates.length + 3;
  const industryField = settings.fields.find(f => f.id === 'industry');
  
  if (industryField && industryField.options) {
    const lifeScienceCount = sortedCandidates.filter(c => c.fields.industry === 'life science').length;
    const foodScienceCount = sortedCandidates.filter(c => c.fields.industry === 'food science').length;
    const otherCount = sortedCandidates.filter(c => !c.fields.industry || (c.fields.industry !== 'life science' && c.fields.industry !== 'food science')).length;

    worksheet.getCell(`A${summaryStartRow}`).value = 'SUMMARY';
    worksheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 14 };
    worksheet.getCell(`A${summaryStartRow + 1}`).value = `Total ${settings.entityName}: ${sortedCandidates.length}`;
    worksheet.getCell(`A${summaryStartRow + 2}`).value = `Life Science: ${lifeScienceCount}`;
    worksheet.getCell(`A${summaryStartRow + 3}`).value = `Food Science: ${foodScienceCount}`;
    worksheet.getCell(`A${summaryStartRow + 4}`).value = `Other/Unspecified: ${otherCount}`;
  }

  // Add boolean field summaries
  settings.fields.forEach((field, index) => {
    if (field.type === 'boolean') {
      const trueCount = sortedCandidates.filter(c => c.fields[field.id]).length;
      worksheet.getCell(`A${summaryStartRow + 5 + index}`).value = `${field.label}: ${trueCount}`;
    }
  });

  // Generate and download the file
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${settings.appName.toLowerCase().replace(/\s+/g, '-')}-${settings.entityName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });
}

export function filterAndSortCandidates(candidates: Candidate[], filters: any, settings: AppSettings): Candidate[] {
  let filtered = [...candidates];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(candidate =>
      candidate.name.toLowerCase().includes(searchLower) ||
      Object.values(candidate.fields).some(value => 
        value && String(value).toLowerCase().includes(searchLower)
      ) ||
      (candidate.notes && candidate.notes.toLowerCase().includes(searchLower))
    );
  }

  // Apply field filters
  Object.entries(filters.fieldFilters).forEach(([fieldId, value]) => {
    if (value && value !== 'all') {
      filtered = filtered.filter(candidate => candidate.fields[fieldId] === value);
    }
  });

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (filters.sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        // Dynamic field sorting
        const fieldConfig = settings.fields.find(f => f.id === filters.sortBy);
        if (fieldConfig?.type === 'text' && fieldConfig.id === 'salary') {
          // Special handling for salary field
          aValue = parseInt(String(a.fields[filters.sortBy] || '0').replace(/[^\d]/g, '')) || 0;
          bValue = parseInt(String(b.fields[filters.sortBy] || '0').replace(/[^\d]/g, '')) || 0;
        } else {
          aValue = String(a.fields[filters.sortBy] || '').toLowerCase();
          bValue = String(b.fields[filters.sortBy] || '').toLowerCase();
        }
    }

    if (filters.sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
}
