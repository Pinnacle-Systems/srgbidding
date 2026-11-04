export const mockVendors = [
  { id: 1, name: "Alpha Textiles", email: "contact@alphatex.com", category: "Yarn" },
  { id: 2, name: "Beta Fabrics", email: "sales@betafabrics.com", category: "Fabric" },
  { id: 3, name: "Gamma Dyes & Spares", email: "info@gammadyesspares.com", category: "Spares & Dyes" },
];

export const mockIndents = [
  { id: "IND-101", type: "yarn", count: "30s", composition: "100% Cotton", ply: "Single", shade: "Raw White", packing: "Cones", quantity: 5000, uom: "kg", targetPrice: 200, status: "available" },
  { id: "IND-102", type: "fabric", construction: "40x40/130x70", gsm: "120", width: "63 inch", color: "White", finish: "Mercerized", quantity: 10000, uom: "meters", targetPrice: 150, status: "available" },
  { id: "IND-103", type: "spares_dyes", partOrDyeCode: "DYE-RED-01", brand: "Dystar", specification: "Reactive Red", quantity: 50, uom: "kg", targetPrice: 500, status: "available" },
  { id: "IND-104", type: "general", description: "Office Chairs", specification: "Ergonomic, Mesh back", quantity: 20, uom: "pcs", targetPrice: null, status: "available" },
];

export const mockTemplates = [
  { id: "TPL-1", name: "Standard Yarn Terms", payment: "30 Days LC", delivery: "FOB", quality: "Standard Mill Reject Policy", penalty: "1% per week", validity: "7 Days" },
];
