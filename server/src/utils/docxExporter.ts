import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
  ShadingType,
} from 'docx';

export async function generateQuestionsDocx(questions: any[]): Promise<Buffer> {
  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      text: 'PlacementVault — Campus Placement Drive Questions Archive',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Official Campus Placement Assessment Repository | Generated on ${new Date().toLocaleDateString()} | Total Questions: ${questions.length}`,
          italics: true,
          color: '555555',
          size: 20,
        }),
      ],
    })
  );

  questions.forEach((q, idx) => {
    // Question Title Heading
    children.push(
      new Paragraph({
        text: `${idx + 1}. ${q.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );

    // Metadata Table
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Company', bold: true, size: 18 })] })],
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: q.company?.name || 'N/A', size: 18 })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Recruitment Year', bold: true, size: 18 })] })],
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${q.recruitmentYear}`, size: 18 })] })],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Interview Round', bold: true, size: 18 })] })],
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: q.interviewRound || 'N/A', size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Category / Difficulty', bold: true, size: 18 })] })],
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${q.category} (${q.difficulty})`, size: 18 })] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Job Role', bold: true, size: 18 })] })],
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: q.jobRole || 'General Tech', size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Contributor', bold: true, size: 18 })] })],
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `${q.author?.name || 'Student'} (${q.author?.department || 'Engineering'})`, size: 18 })],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    children.push(metaTable);

    // Problem Description
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Problem Statement / Questions Asked:', bold: true, size: 20 })],
        spacing: { before: 180, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: q.description || '', size: 20 })],
        spacing: { after: 140 },
      })
    );

    // Experience Notes
    if (q.experienceNotes) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Candidate Experience Notes & Preparation Tips:', bold: true, italics: true, color: 'B45309', size: 19 }),
          ],
          spacing: { before: 100, after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: q.experienceNotes, italics: true, size: 19 })],
          spacing: { after: 140 },
        })
      );
    }

    // Solution Code / Explanation
    if (q.initialSolution && (q.initialSolution.code || q.initialSolution.explanation)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Proposed Solution (${q.initialSolution.language || 'Code'}):`,
              bold: true,
              color: '1E3A8A',
              size: 20,
            }),
          ],
          spacing: { before: 100, after: 60 },
        })
      );

      if (q.initialSolution.explanation) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: q.initialSolution.explanation, size: 19 })],
            spacing: { after: 80 },
          })
        );
      }

      if (q.initialSolution.code) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: q.initialSolution.code, font: 'Courier New', size: 16 })],
                      }),
                    ],
                    shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
                  }),
                ],
              }),
            ],
          })
        );
      }
    }

    // Divider
    children.push(
      new Paragraph({
        text: '_________________________________________________________________________________',
        spacing: { before: 180, after: 180 },
        alignment: AlignmentType.CENTER,
      })
    );
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBuffer(doc);
}

export async function generateStudentsDocx(students: any[]): Promise<Buffer> {
  const children: any[] = [
    new Paragraph({
      text: 'PlacementVault — Registered Student Roster',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [
        new TextRun({
          text: `Official Student Accounts Record | Generated on ${new Date().toLocaleDateString()} | Total Registered Students: ${students.length}`,
          italics: true,
          color: '555555',
          size: 20,
        }),
      ],
    }),
  ];

  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Student Name', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 22, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'College / University', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 22, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Department', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 18, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Batch', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 9, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 9, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  students.forEach((s, idx) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: s.name || '', size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: s.email || '', size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: s.collegeName || 'N/A', size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: s.department || 'N/A', size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `${s.graduationYear || 'N/A'}`, size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: s.status || 'active', bold: true, size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
        ],
      })
    );
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBuffer(doc);
}

export async function generateCompaniesDocx(companies: any[]): Promise<Buffer> {
  const children: any[] = [
    new Paragraph({
      text: 'PlacementVault — Campus Recruiting Companies Directory',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [
        new TextRun({
          text: `Official Company Directory | Generated on ${new Date().toLocaleDateString()} | Total Companies: ${companies.length}`,
          italics: true,
          color: '555555',
          size: 20,
        }),
      ],
    }),
  ];

  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Company Name', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Industry', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Website', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Questions', bold: true, size: 18 })] })],
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  companies.forEach((c, idx) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: c.name || '', bold: true, size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: c.industry || 'Technology', size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: c.website || 'N/A', size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `${c.totalQuestionsCount || 0}`, size: 17 })] })],
            shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
          }),
        ],
      })
    );
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBuffer(doc);
}
