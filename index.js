const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");
const CliTable3 = require("cli-table3");

const key = "47aea3b2d8364bffb2646d7467e5d982";
const endpoint = "https://di-pettest.cognitiveservices.azure.com/";

// Function to generate the table
function generateTable(data) {
  // Create a new table instance

  console.log("data: ", data);
  const firstTable = data[0];

  console.log("firstTable: ", firstTable);
  const columnHeaders = firstTable.cells.filter(
    (cell) => cell.kind === "columnHeader"
  );

  const cellsWithContent = firstTable.cells.filter(
    (cell) => cell.kind === "content"
  );

  const groupedByRowIndex = cellsWithContent.reduce((acc, cell) => {
    // Initialize the array for this rowIndex if it doesn't exist
    if (!acc[cell.rowIndex]) {
      acc[cell.rowIndex] = [];
    }
    // Add the cell to the array for its rowIndex
    acc[cell.rowIndex].push(cell);
    return acc;
  }, {});

  // Extract the values (arrays of cells) to get an array of arrays
  const rows = Object.values(groupedByRowIndex);

  const table = new CliTable3({
    head: columnHeaders.map((header) => header.content),
    colWidths: [50, 50, 50],
  });

  rows.forEach((row) => {
    table.push(row.map((cell) => cell.content));
  });

  // Print the table to the console
  console.log(table.toString());
}

// sample document
const formUrl =
  "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/sample-layout.pdf";
// "https://study.com/cimages/multimages/16/ad_table2_sized1130897530286274811.jpg";
//   "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/sample-layout.pdf";

async function main() {
  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  const poller = await client.beginAnalyzeDocumentFromUrl(
    "prebuilt-layout",
    formUrl
  );

  const { pages, tables } = await poller.pollUntilDone();

  generateTable(tables);

  if (pages.length <= 0) {
    console.log("No pages were extracted from the document.");
  } else {
    console.log("Pages:");
    console.log(pages[0].selectionMarks);
    console.log(pages[0].lines);

    for (const page of pages) {
      console.log("- Page", page.pageNumber, `(unit: ${page.unit})`);
      console.log(`  ${page.width}x${page.height}, angle: ${page.angle}`);
      console.log(`  ${page.lines.length} lines, ${page.words.length} words`);
    }
  }

  if (tables.length <= 0) {
    console.log("No tables were extracted from the document.");
  } else {
    console.log("Tables:");
    for (const table of tables) {
      console.log(
        `- Extracted table: ${table.columnCount} columns, ${table.rowCount} rows (${table.cells.length} cells)`
      );
    }
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});

const table = [
  {
    rowCount: 5,
    columnCount: 3,
    cells: [
      {
        kind: "columnHeader",
        rowIndex: 0,
        columnIndex: 0,
        rowSpan: 1,
        columnSpan: 1,
        content: "Title of each class",
        boundingRegions: [
          {
            pageNumber: 1,
            polygon: [
              { x: 0.5561, y: 4.8963 },
              { x: 3.8728, y: 4.8963 },
              { x: 3.8728, y: 5.1163 },
              { x: 0.5561, y: 5.1163 },
            ],
          },
        ],
        spans: [{ offset: 636, length: 19 }],
      },
    ],
  },
  {
    kind: "content",
    rowIndex: 1,
    columnIndex: 0,
    rowSpan: 1,
    columnSpan: 1,
    content: "Common stock, $0.00000625 par value per share",
    boundingRegions: [
      {
        pageNumber: 1,
        polygon: [
          { x: 0.5561, y: 5.1163 },
          { x: 3.8728, y: 5.1163 },
          { x: 3.8728, y: 5.2997 },
          { x: 0.5561, y: 5.2997 },
        ],
      },
    ],
    spans: [{ offset: 708, length: 45 }],
  },
];
