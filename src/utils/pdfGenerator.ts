import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PersonProfile {
  name: string;
  confidence: number;
  profiles: Array<{
    platform: string;
    url: string;
    description?: string;
    relevanceScore?: number;
  }>;
  location?: string;
  summary?: string;
  education?: string[];
  experiences?: string[];
}

interface OSINTResult {
  summary: string;
  totalProfilesFound: number;
  persons: PersonProfile[];
  rawLinks: string[];
  alerts: string[];
  searchQuery: string;
  timestamp: string;
}

export const generatePDFReport = (results: OSINTResult) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Define colors (matching design system)
  const primaryColor: [number, number, number] = [0, 255, 255]; // Cyan
  const secondaryColor: [number, number, number] = [138, 43, 226]; // Purple
  const darkBg: [number, number, number] = [15, 23, 42]; // Dark background
  const textColor: [number, number, number] = [230, 255, 250]; // Light text
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add new page if needed
  const checkPageBreak = (heightNeeded: number) => {
    if (yPosition + heightNeeded > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header with gradient background effect
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO OSINT', margin, 30);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text('Análise de Inteligência de Fontes Abertas', margin, 38);
  
  yPosition = 60;

  // Metadata section
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const metadataY = yPosition + 8;
  doc.text(`Pesquisa: ${results.searchQuery}`, margin + 5, metadataY);
  doc.text(`Data/Hora: ${new Date(results.timestamp).toLocaleString('pt-BR')}`, margin + 5, metadataY + 7);
  doc.text(`Fontes Consultadas: ${results.rawLinks.length} referências públicas`, margin + 5, metadataY + 14);
  doc.text(`Perfis Encontrados: ${results.totalProfilesFound}`, margin + 5, metadataY + 21);
  
  yPosition += 45;

  // Executive Summary
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('📋 Resumo Executivo', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const summaryLines = doc.splitTextToSize(results.summary, contentWidth);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  // Alerts section
  if (results.alerts && results.alerts.length > 0) {
    checkPageBreak(20 + (results.alerts.length * 6));
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 150, 0);
    doc.text('⚠️ Alertas e Limitações', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    results.alerts.forEach((alert) => {
      checkPageBreak(6);
      const alertLines = doc.splitTextToSize(`• ${alert}`, contentWidth - 5);
      doc.text(alertLines, margin + 3, yPosition);
      yPosition += alertLines.length * 5;
    });
    
    yPosition += 8;
  }

  // Persons section
  results.persons.forEach((person, index) => {
    checkPageBreak(40);
    
    // Person header
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(margin, yPosition - 5, 5, 10, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`👤 ${person.name}`, margin + 8, yPosition);
    
    yPosition += 8;
    
    // Person details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Confiança: ${person.confidence}%`, margin, yPosition);
    
    if (person.location) {
      doc.text(`  |  Localização: ${person.location}`, margin + 35, yPosition);
    }
    
    yPosition += 8;
    
    // Summary
    if (person.summary) {
      checkPageBreak(15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Resumo:', margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(person.summary, contentWidth);
      const maxLines = 10; // Limit summary lines
      const displayLines = summaryLines.slice(0, maxLines);
      doc.text(displayLines, margin, yPosition);
      yPosition += displayLines.length * 4.5;
      
      if (summaryLines.length > maxLines) {
        doc.setTextColor(150, 150, 150);
        doc.text('(resumo truncado...)', margin, yPosition);
        yPosition += 5;
      }
      
      yPosition += 5;
    }
    
    // Education
    if (person.education && person.education.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('🎓 Formação:', margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      person.education.slice(0, 3).forEach((edu) => {
        checkPageBreak(5);
        const eduLines = doc.splitTextToSize(`• ${edu}`, contentWidth - 5);
        doc.text(eduLines, margin + 3, yPosition);
        yPosition += eduLines.length * 4.5;
      });
      
      yPosition += 3;
    }
    
    // Experiences
    if (person.experiences && person.experiences.length > 0) {
      checkPageBreak(15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('💼 Experiências:', margin, yPosition);
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      person.experiences.slice(0, 3).forEach((exp) => {
        checkPageBreak(5);
        const expLines = doc.splitTextToSize(`• ${exp}`, contentWidth - 5);
        doc.text(expLines, margin + 3, yPosition);
        yPosition += expLines.length * 4.5;
      });
      
      yPosition += 3;
    }
    
    // Profiles table
    if (person.profiles && person.profiles.length > 0) {
      checkPageBreak(30);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('🔗 Perfis Online:', margin, yPosition);
      yPosition += 8;
      
      const tableData = person.profiles.map((profile) => [
        profile.platform,
        profile.description || 'N/A',
        profile.relevanceScore !== undefined ? `${profile.relevanceScore}%` : 'N/A',
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Plataforma', 'Descrição', 'Relevância']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [138, 43, 226],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [60, 60, 60],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 90 },
          2: { cellWidth: 25 },
        },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Separator between persons
    if (index < results.persons.length - 1) {
      checkPageBreak(10);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  });

  // References section
  checkPageBreak(30);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('📚 Referências Consultadas', margin, yPosition);
  yPosition += 8;
  
  const referencesData = results.rawLinks.map((link, index) => [
    `${index + 1}`,
    link,
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'URL']],
    body: referencesData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [60, 60, 60],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: contentWidth - 10 },
    },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Footer disclaimer
  checkPageBreak(20);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const disclaimerText = 'ℹ️ Todas as informações apresentadas neste relatório foram extraídas exclusivamente das fontes listadas acima.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(disclaimerLines, margin + 5, yPosition + 5);

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 20,
      doc.internal.pageSize.height - 10
    );
    
    // Add generation timestamp on each page
    doc.setFontSize(7);
    doc.text(
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      margin,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  const filename = `relatorio-osint-${results.searchQuery.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(filename);
};
