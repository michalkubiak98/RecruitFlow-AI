import { Candidate } from '../types';
import * as ExcelJS from 'exceljs';

export function exportToExcel(candidates: Candidate[]) {
  // Sort candidates by industry first, then by name
  const sortedCandidates = [...candidates].sort((a, b) => {
    // First sort by industry
    if (a.industry !== b.industry) {
      if (a.industry === 'life science' && b.industry === 'food science') return -1;
      if (a.industry === 'food science' && b.industry === 'life science') return 1;
      if (a.industry && !b.industry) return -1;
      if (!a.industry && b.industry) return 1;
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('RecruitFlow Candidates');

  // Set up columns with proper widths and headers
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Industry', key: 'industry', width: 15 },
    { header: 'Role/Position', key: 'roles', width: 25 },
    { header: 'Location', key: 'location', width: 15 },
    { header: 'Salary', key: 'salary', width: 12 },
    { header: 'Can Drive', key: 'drives', width: 10 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Date Added', key: 'createdAt', width: 12 },
    { header: 'Last Updated', key: 'updatedAt', width: 12 }
  ];

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
    const row = worksheet.addRow({
      name: candidate.name,
      industry: candidate.industry || 'Not specified',
      roles: candidate.roles,
      location: candidate.location,
      salary: candidate.salary,
      drives: candidate.drives ? 'Yes' : 'No',
      notes: candidate.notes || '',
      createdAt: new Date(candidate.createdAt).toLocaleDateString(),
      updatedAt: new Date(candidate.updatedAt).toLocaleDateString()
    });

    // Style based on industry
    if (candidate.industry === 'life science') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'EBF8FF' } // Light blue for life science
      };
    } else if (candidate.industry === 'food science') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0FDF4' } // Light green for food science
      };
    }

    // Style the "Can Drive" column
    const drivesCell = row.getCell('drives');
    if (candidate.drives) {
      drivesCell.font = { color: { argb: '059669' }, bold: true }; // Green for Yes
    } else {
      drivesCell.font = { color: { argb: 'DC2626' } }; // Red for No
    }

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
    to: `I${sortedCandidates.length + 1}`
  };

  // Freeze the header row
  worksheet.views = [
    { state: 'frozen', ySplit: 1 }
  ];

  // Add summary information
  const summaryStartRow = sortedCandidates.length + 3;
  const lifeScienceCount = sortedCandidates.filter(c => c.industry === 'life science').length;
  const foodScienceCount = sortedCandidates.filter(c => c.industry === 'food science').length;
  const otherCount = sortedCandidates.filter(c => !c.industry || (c.industry !== 'life science' && c.industry !== 'food science')).length;
  const canDriveCount = sortedCandidates.filter(c => c.drives).length;

  worksheet.getCell(`A${summaryStartRow}`).value = 'SUMMARY';
  worksheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 14 };
  worksheet.getCell(`A${summaryStartRow + 1}`).value = `Total Candidates: ${sortedCandidates.length}`;
  worksheet.getCell(`A${summaryStartRow + 2}`).value = `Life Science: ${lifeScienceCount}`;
  worksheet.getCell(`A${summaryStartRow + 3}`).value = `Food Science: ${foodScienceCount}`;
  worksheet.getCell(`A${summaryStartRow + 4}`).value = `Other/Unspecified: ${otherCount}`;
  worksheet.getCell(`A${summaryStartRow + 5}`).value = `Can Drive: ${canDriveCount}`;

  // Generate and download the file
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recruitflow-candidates-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });
}

export function filterAndSortCandidates(candidates: Candidate[], filters: any): Candidate[] {
  let filtered = [...candidates];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(candidate =>
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.roles.toLowerCase().includes(searchLower) ||
      candidate.location.toLowerCase().includes(searchLower) ||
      (candidate.notes && candidate.notes.toLowerCase().includes(searchLower))
    );
  }

  // Apply industry filter
  if (filters.industry !== 'all') {
    filtered = filtered.filter(candidate => candidate.industry === filters.industry);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (filters.sortBy) {
      case 'salary':
        // Extract numbers from salary strings for proper sorting
        aValue = parseInt(a.salary.replace(/[^\d]/g, '')) || 0;
        bValue = parseInt(b.salary.replace(/[^\d]/g, '')) || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default: // name
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (filters.sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
}
