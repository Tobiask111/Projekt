import { countryNames } from './Name_Mapping.js';


// Get viewport dimensions for responsive sizing
const width = window.innerWidth;
const height = window.innerHeight;

// Create main SVG container with viewport dimensions
const svg = d3.select("#Map")
    .attr("width", width)
    .attr("height", height)
    .style("border-radius", "25px");

// Create group for map elements to enable zooming
const mapGroup = svg.append("g");

// Configure zoom behavior with min/max scale and drag limits
const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Allow zooming between 1x and 8x
    .translateExtent([[0, 0], [width, height]]) // Limit panning
    .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
    });

// Apply zoom to SVG
svg.call(zoom);

// Set up Mercator projection for world map
const projection = d3.geoMercator()
    .scale(width/11) // Scale map based on viewport width
    .translate([width/2.5, height/1.8]); // Position map center point

// Create path generator for drawing country boundaries
const path = d3.geoPath().projection(projection);

// Store current visualization state
let currentState = {
    tradeType: 'export', // Default trade type
    category: 'medicin', // Default category
    year: '2021'  // Default year
};


// Map categories to their API endpoints
const categories = {
    kaffe: { endpoint: '/api/onKaffe', displayName: 'Kaffe' },
    maskiner: { endpoint: '/api/onMaskiner', displayName: 'Maskiner' },
    levendeDyr: { endpoint: '/api/onLevendeDyr', displayName: 'Levende dyr' },
    medicin: { endpoint: '/api/onMedicin', displayName: 'Medicin' },
    tobak: { endpoint: '/api/onTobak', displayName: 'Tobak' }
};

// Global variables for storing map data
let geoDataWithValues; // Combined geographic and trade data
let worldGeoData;      // Raw geographic data
let rawCategoryData;   // Raw trade data for current category

// Fetch and process trade data for selected category
async function fetchCategoryData(category) {
    try {
        const response = await fetch(categories[category].endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Determine field names based on category type
        const exportField = category === 'levendeDyr' ? 'eksport_levende_dyr' : `eksport_${category}`;
        const importField = category === 'levendeDyr' ? 'import_levende_dyr' : `import_${category}`;

        // Transform data into standardized format
        return data.map(d => ({
            land: countryNames[d.land] || d.land,
            originalLand: d.land,
            export: +d[exportField] || 0,
            import: +d[importField] || 0,
            årstal: +d.tid
        }));
    } catch (error) {
        console.error(`Error fetching ${category} data:`, error);
        return [];
    }
}

// Initialize map and set up event listeners
async function initializeMap() {
    try {
        // Load world map data
        worldGeoData = await d3.json("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json");
        
        // Load initial trade data
        await updateMapData();

        // Set up dropdown event listeners
        d3.select("#tradeType").on("change", async function() {
            currentState.tradeType = this.value;
            updateMap();
        });

        d3.select("#category").on("change", async function() {
            currentState.category = this.value;
            await updateMapData();
        });

        d3.select("#year").on("change", async function() {
            currentState.year = this.value;
            await updateMapWithYear();
        });

        // Initialize year dropdown
        updateYearDropdown();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Update year dropdown options based on available data
function updateYearDropdown() {
    if (!rawCategoryData) return;

    // Get unique years and sort in descending order
    const availableYears = [...new Set(rawCategoryData.map(d => d.årstal))]
        .sort((a, b) => b - a);

    const yearSelect = d3.select("#year");
    
    // Remember current selection
    const currentYear = yearSelect.property("value");
    
    // Update dropdown options
    yearSelect.selectAll("option")
        .data(availableYears)
        .join("option")
        .attr("value", d => d)
        .text(d => d);

    // Restore previous selection or use latest year
    if (availableYears.includes(+currentYear)) {
        yearSelect.property("value", currentYear);
    } else {
        yearSelect.property("value", availableYears[0]);
        currentState.year = availableYears[0].toString();
    }
}

// Update map data when category changes
async function updateMapData() {
    rawCategoryData = await fetchCategoryData(currentState.category);
    updateYearDropdown();
    await updateMapWithYear();
}

// Update map visualization with data for selected year
async function updateMapWithYear() {
    // Filter data for current year
    const yearData = rawCategoryData.filter(d => d.årstal.toString() === currentState.year);
    
    // Create lookup map for quick data access
    const dataMap = new Map(yearData.map(d => [d.land, {
        export: d.export,
        import: d.import,
        originalLand: d.originalLand,
        årstal: d.årstal
    }]));

    // Combine geographic and trade data
    geoDataWithValues = {
        ...worldGeoData,
        features: worldGeoData.features.map(feature => {
            const countryName = feature.properties.name;
            const dataEntry = dataMap.get(countryName);

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    export: dataEntry?.export || 0,
                    import: dataEntry?.import || 0,
                    originalLand: dataEntry?.originalLand || countryName,
                    årstal: dataEntry?.årstal || null
                }
            };
        })
    };

    updateMap();
}

// Update map visualization
function updateMap() {
    mapGroup.selectAll("path")
        .data(geoDataWithValues.features.filter(f => 
            !["Bermuda", "Antarctica", "Seven seas (open ocean)"].includes(f.properties.name)
        ))
        .join("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "#1e6d8c")
        .style("stroke", "#fff")
        .style("stroke-width", 0.3)
        .style("opacity", 1)
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseleave", mouseLeave);
}

// Tooltip functions for interactive features
const tooltip = d3.select(".tooltip");

// Handle mouse hover over countries
function mouseOver(event, d) {
    if (["Bermuda", "Antarctica", "Seven seas (open ocean)"].includes(d.properties.name)) return;

    d3.select(event.currentTarget)
        .attr("fill", "#7aa6c2")
        .attr("stroke", "#fff");
    
    const danishName = Object.entries(countryNames).find(([danish, english]) => english === d.properties.name)?.[0] || d.properties.name;
    const value = currentState.tradeType === 'export' ? d.properties.export : d.properties.import;
    const typeText = currentState.tradeType === 'export' ? 'Eksport' : 'Import';
    
    tooltip.style("opacity", 1)
        .html(`<strong>${danishName}</strong><br/>
               ${typeText} af ${categories[currentState.category].displayName}: ${value.toLocaleString()}.000 kr.<br/>
               År: ${currentState.year}`);
}

// Update tooltip position on mouse move
function mouseMove(event) {
    tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
}

// Reset country appearance when mouse leaves
function mouseLeave(event) {
    d3.select(event.currentTarget)
        .attr("fill", "#1e6d8c")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.3)
        .attr("opacity", 1);
    tooltip.style("opacity", 0);
}

// Start the map when script loads
initializeMap();