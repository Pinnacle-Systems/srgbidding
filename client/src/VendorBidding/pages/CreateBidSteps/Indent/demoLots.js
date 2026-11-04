export const DEFAULT_DEMO_LOTS = [
  {
    id: 101,
    name: "Knitting unit monthly needs",
    status: "Open",
    unreadCount: 0,
    indents: [
      {
        id: 'IND-3101',
        category: 'Yarn',
        department: 'Spinning',
        item_name: 'Cotton combed yarn',
        count: '40s',
        blend: '100% cotton',
        shade: 'Raw white',
        qty: 5000,
        uom: 'kg',
        requiredBy: '30 Oct',
        commonDocuments: [
          {
            id: 'cdoc-1',
            title: 'SRG Standard Purchase Specification - Combed Yarn',
            category: 'Specs',
            fileName: 'SRG_Spec_Yarn_Rev3.pdf',
            fileSize: '1.8 MB',
            version: '3.1',
            status: 'Up to Date',
            uploadedBy: 'Buyer (Quality Team)',
            updatedAt: '12 Oct, 11:00 AM',
            notes: 'Standard quality guidelines for 40s combed hosiery yarn.'
          }
        ],
        vendors: [
          {
            id: 'v1',
            name: 'Kovai Yarns',
            label: 'Kovai Yarns',
            documents: [
              {
                id: 'doc-v1-1',
                title: 'Technical Data Sheet (TDS)',
                category: 'TDS',
                fileName: 'TDS_40s_Combed_Kovai_v2.pdf',
                fileSize: '1.2 MB',
                version: '2.0',
                status: 'Up to Date',
                uploadedBy: 'Kovai Yarns (Vendor)',
                updatedAt: '16 Oct, 09:40 AM',
                notes: 'Uster statistics: CSP 2950, Rkm 19.2, Count CV% 1.15.'
              },
              {
                id: 'doc-v1-2',
                title: 'OEKO-TEX Standard 100 Certificate',
                category: 'Compliance',
                fileName: 'OekoTex_Standard100_Kovai_2026.pdf',
                fileSize: '840 KB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Kovai Yarns (Vendor)',
                updatedAt: '14 Oct, 03:15 PM',
                notes: 'Valid through Dec 2026.'
              }
            ]
          },
          {
            id: 'v2',
            name: 'Annai Spinners',
            label: 'Annai Spinners',
            documents: [
              {
                id: 'doc-v2-1',
                title: 'Technical Data Sheet (TDS)',
                category: 'TDS',
                fileName: 'Annai_40s_TDS_Draft.pdf',
                fileSize: '950 KB',
                version: '1.0',
                status: 'Update Needed',
                uploadedBy: 'Annai Spinners (Vendor)',
                updatedAt: '10 Oct, 02:00 PM',
                notes: 'Tolerance for moisture content needs revision as per indent specs.'
              }
            ]
          },
          {
            id: 'v3',
            name: 'Sri Murugan Mills',
            label: 'Sri Murugan Mills',
            documents: [
              {
                id: 'doc-v3-1',
                title: 'Sample Test Report & CSP Certificate',
                category: 'Test Report',
                fileName: 'Murugan_CSP_Test_Report.pdf',
                fileSize: '1.5 MB',
                version: '1.0',
                status: 'Under Review',
                uploadedBy: 'Sri Murugan Mills (Vendor)',
                updatedAt: '15 Oct, 05:20 PM',
                notes: 'Awaiting lab dip signoff from QA.'
              }
            ]
          }
        ]
      },
      {
        id: 'IND-3160',
        category: 'Dyes and chemicals',
        department: 'Dyehouse',
        item_name: 'Reactive Blue 19',
        ciCas: 'CI 61200',
        strength: '150%',
        hazard: 'Class 9',
        qty: 600,
        uom: 'kg',
        requiredBy: '28 Oct',
        commonDocuments: [
          {
            id: 'cdoc-2',
            title: 'Dyehouse Chemical Safety Protocol',
            category: 'Compliance',
            fileName: 'Chemical_Safety_Compliance_v1.pdf',
            fileSize: '2.4 MB',
            version: '1.0',
            status: 'Up to Date',
            uploadedBy: 'Buyer (Safety Officer)',
            updatedAt: '11 Oct, 10:00 AM',
            notes: 'Mandatory standard compliance for Reactive Blue supply.'
          }
        ],
        vendors: [
          {
            id: 'v4',
            name: 'ColourChem India',
            label: 'ColourChem India',
            documents: [
              {
                id: 'doc-v4-1',
                title: 'Material Safety Data Sheet (MSDS)',
                category: 'Compliance',
                fileName: 'MSDS_ReactiveBlue19_ColourChem.pdf',
                fileSize: '2.1 MB',
                version: '3.0',
                status: 'Up to Date',
                uploadedBy: 'ColourChem India',
                updatedAt: '15 Oct, 11:30 AM',
                notes: 'GHS compliant 16-section MSDS.'
              },
              {
                id: 'doc-v4-2',
                title: 'ZDHC Level 3 Conformance Certificate',
                category: 'Compliance',
                fileName: 'ZDHC_Level3_Cert.pdf',
                fileSize: '650 KB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'ColourChem India',
                updatedAt: '12 Oct, 04:00 PM',
                notes: 'Gateway verified certificate.'
              }
            ]
          },
          {
            id: 'v5',
            name: 'Arvind Dyestuffs',
            label: 'Arvind Dyestuffs',
            documents: [
              {
                id: 'doc-v5-1',
                title: 'Material Safety Data Sheet (MSDS)',
                category: 'Compliance',
                fileName: 'MSDS_ReactiveBlue_Arvind.pdf',
                fileSize: '1.7 MB',
                version: '1.2',
                status: 'Update Needed',
                uploadedBy: 'Arvind Dyestuffs',
                updatedAt: '08 Oct, 01:10 PM',
                notes: 'Expired hazard classification page 4 requires resubmission.'
              }
            ]
          }
        ]
      },
      {
        id: 'IND-3140',
        category: 'Machine spares',
        department: 'Maintenance',
        item_name: 'Needle cylinder',
        machine: 'Circular knitting CK-12',
        partNo: 'NC-4471',
        make: 'Mayer and Cie',
        qty: 4,
        uom: 'nos',
        requiredBy: '08 Nov',
        commonDocuments: [
          {
            id: 'cdoc-3',
            title: 'Engineering Drawing & Dimension Blueprint',
            category: 'Specs',
            fileName: 'CK12_NeedleCylinder_DWG_4471.pdf',
            fileSize: '3.8 MB',
            version: '2.1',
            status: 'Up to Date',
            uploadedBy: 'Buyer (Maintenance Lead)',
            updatedAt: '05 Oct, 09:30 AM',
            notes: 'Critical tolerances highlighted on page 2.'
          }
        ],
        vendors: [
          {
            id: 'v6',
            name: 'Textile Spares Co',
            label: 'Textile Spares Co',
            documents: [
              {
                id: 'doc-v6-1',
                title: 'OEM Calibration & Hardness Certificate',
                category: 'Test Report',
                fileName: 'Hardness_Cert_NC4471.pdf',
                fileSize: '920 KB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Textile Spares Co',
                updatedAt: '14 Oct, 06:10 PM',
                notes: 'Surface hardness HRC 60-62 verified.'
              }
            ]
          },
          {
            id: 'v7',
            name: 'Mayer Authorised Dealer',
            label: 'Mayer Authorised Dealer',
            documents: [
              {
                id: 'doc-v7-1',
                title: 'Manufacturer Authorization Letter (MAL)',
                category: 'Compliance',
                fileName: 'Mayer_Cie_Dealer_MAL_2026.pdf',
                fileSize: '480 KB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Mayer Authorised Dealer',
                updatedAt: '13 Oct, 11:45 AM',
                notes: 'Official dealership validity through 2027.'
              }
            ]
          }
        ]
      },
      {
        id: 'IND-3180',
        category: 'General',
        department: 'Admin',
        item_name: 'Heavy Duty Packaging Film',
        spec: '100 micron LDPE shrink film 1200mm',
        uom: 'rolls',
        qty: 80,
        requiredBy: '12 Nov',
        commonDocuments: [],
        vendors: [
          {
            id: 'v8',
            name: 'PolyPack Industries',
            label: 'PolyPack Industries',
            documents: [
              {
                id: 'doc-v8-1',
                title: 'Tensile Strength & Micrometer Spec Sheet',
                category: 'TDS',
                fileName: 'PolyPack_100Micron_Spec.pdf',
                fileSize: '750 KB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'PolyPack Industries',
                updatedAt: '14 Oct, 02:15 PM',
                notes: 'Dart drop impact test > 250g.'
              }
            ]
          },
          {
            id: 'v9',
            name: 'Sri Ganesh Packaging',
            label: 'Sri Ganesh Packaging',
            documents: []
          }
        ]
      }
    ]
  },
  {
    id: 102,
    name: "Process house supply",
    status: "Open",
    unreadCount: 3,
    indents: [
      {
        id: 'IND-3104',
        category: 'Yarn',
        department: 'Knitting',
        item_name: 'PC blend yarn',
        count: '30s',
        blend: '65/35 PC',
        shade: 'Grey melange',
        qty: 2500,
        uom: 'kg',
        requiredBy: '05 Nov',
        commonDocuments: [],
        vendors: [
          {
            id: 'v1',
            name: 'Kovai Yarns',
            label: 'Kovai Yarns',
            documents: [
              {
                id: 'doc-v1-30s',
                title: '30s PC Blend Shade & Count TDS',
                category: 'TDS',
                fileName: 'Kovai_30s_PC_TDS.pdf',
                fileSize: '1.1 MB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Kovai Yarns',
                updatedAt: '14 Oct, 10:00 AM',
                notes: 'Spectrophotometer readings DE < 0.5.'
              }
            ]
          },
          {
            id: 'v10',
            name: 'Premier Mills',
            label: 'Premier Mills',
            documents: [
              {
                id: 'doc-v10-1',
                title: 'Blend Ratio Certificate (65/35)',
                category: 'Test Report',
                fileName: 'Premier_Blend_Ratio_Cert.pdf',
                fileSize: '890 KB',
                version: '1.0',
                status: 'Under Review',
                uploadedBy: 'Premier Mills',
                updatedAt: '15 Oct, 03:30 PM',
                notes: 'Chemical dissolution test method ASTM D629.'
              }
            ]
          }
        ]
      },
      {
        id: 'IND-3162',
        category: 'Dyes and chemicals',
        department: 'Dyehouse',
        item_name: 'Disperse Blue 56',
        ciCas: 'CI 63285',
        strength: '200%',
        hazard: 'Non-hazardous',
        qty: 1200,
        uom: 'kg',
        requiredBy: '02 Nov',
        commonDocuments: [],
        vendors: [
          {
            id: 'v4',
            name: 'ColourChem India',
            label: 'ColourChem India',
            documents: [
              {
                id: 'doc-v4-blue56',
                title: 'TDS & Purity Certificate',
                category: 'TDS',
                fileName: 'ColourChem_DisperseBlue56_TDS.pdf',
                fileSize: '1.4 MB',
                version: '2.0',
                status: 'Up to Date',
                uploadedBy: 'ColourChem India',
                updatedAt: '15 Oct, 09:20 AM',
                notes: 'Spectrophotometric purity > 99%.'
              }
            ]
          },
          {
            id: 'v11',
            name: 'Atul Dyes',
            label: 'Atul Dyes',
            documents: []
          },
          {
            id: 'v12',
            name: 'Pidilite Tech',
            label: 'Pidilite Tech',
            documents: [
              {
                id: 'doc-v12-1',
                title: 'Disperse Blue 56 MSDS',
                category: 'Compliance',
                fileName: 'Pidilite_MSDS_Blue56.pdf',
                fileSize: '1.8 MB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Pidilite Tech',
                updatedAt: '13 Oct, 04:00 PM',
                notes: 'Safety data sheet registered.'
              }
            ]
          }
        ]
      },
      {
        id: 'IND-3143',
        category: 'Machine spares',
        department: 'Processing',
        item_name: 'Squeegee blades',
        machine: 'Rotary printing machine',
        partNo: 'SQ-902',
        make: 'Stork',
        qty: 12,
        uom: 'nos',
        requiredBy: '15 Nov',
        commonDocuments: [],
        vendors: [
          {
            id: 'v13',
            name: 'Stork Spares',
            label: 'Stork Spares',
            documents: [
              {
                id: 'doc-v13-1',
                title: 'Blade Profile & Edge Tolerance Report',
                category: 'Specs',
                fileName: 'Stork_SQ902_Spec.pdf',
                fileSize: '620 KB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Stork Spares',
                updatedAt: '11 Oct, 11:15 AM',
                notes: 'Straightness within 0.05mm.'
              }
            ]
          },
          {
            id: 'v14',
            name: 'Kusters Tech',
            label: 'Kusters Tech',
            documents: []
          }
        ]
      }
    ]
  },
  {
    id: 103,
    name: "Garment unit requirements",
    status: "Draft",
    unreadCount: 0,
    indents: [
      {
        id: 'IND-3105',
        category: 'Yarn',
        department: 'Weaving',
        item_name: 'Viscose filament',
        count: '120D',
        blend: '100% viscose',
        shade: 'Bleached white',
        qty: 1500,
        uom: 'kg',
        requiredBy: '20 Nov',
        commonDocuments: [],
        vendors: [
          {
            id: 'v15',
            name: 'Grasim Fibres',
            label: 'Grasim Fibres',
            documents: [
              {
                id: 'doc-v15-1',
                title: 'FSC & EcoVadis Sustainability Cert',
                category: 'Compliance',
                fileName: 'Grasim_Viscose_FSC_Cert.pdf',
                fileSize: '1.3 MB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'Grasim Fibres',
                updatedAt: '12 Oct, 03:45 PM',
                notes: 'Eco-responsible fiber certification.'
              }
            ]
          },
          {
            id: 'v16',
            name: 'Sangeeth Textiles',
            label: 'Sangeeth Textiles',
            documents: []
          }
        ]
      },
      {
        id: 'IND-3120',
        category: 'Fabric',
        department: 'Garmenting',
        item_name: 'Cotton Interlock Knit',
        construction: '40s Combed Interlock',
        gsm: '220',
        width: '60"',
        shade: 'Navy Blue',
        qty: 2000,
        uom: 'kg',
        requiredBy: '25 Nov',
        commonDocuments: [],
        vendors: [
          {
            id: 'v17',
            name: 'KG Fabriks',
            label: 'KG Fabriks',
            documents: [
              {
                id: 'doc-v17-1',
                title: 'Color Fastness to Washing & Rubbing Report',
                category: 'Test Report',
                fileName: 'KG_ColorFastness_Navy_Grade4.pdf',
                fileSize: '1.1 MB',
                version: '1.0',
                status: 'Up to Date',
                uploadedBy: 'KG Fabriks',
                updatedAt: '14 Oct, 01:20 PM',
                notes: 'ISO 105-C06 Grade 4-5 achieved.'
              }
            ]
          },
          {
            id: 'v18',
            name: 'Vardhman Textiles',
            label: 'Vardhman Textiles',
            documents: [
              {
                id: 'doc-v18-1',
                title: 'Fabric Shrinkage & Spirality Test',
                category: 'Test Report',
                fileName: 'Vardhman_Interlock_Shrinkage.pdf',
                fileSize: '950 KB',
                version: '1.0',
                status: 'Under Review',
                uploadedBy: 'Vardhman Textiles',
                updatedAt: '15 Oct, 11:00 AM',
                notes: 'Length shrinkage -3.2%, Width -2.1%.'
              }
            ]
          }
        ]
      }
    ]
  }
];
