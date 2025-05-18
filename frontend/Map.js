import { countryNames } from './Name_Mapping.js';

const width = 1500, height = 700;

// 1. Create SVG container
const svg = d3.select("#Map")
    .attr("width", width)
    .attr("height", height);

// Add buttons for toggling between import and export


// --- Add this zoom block ---np
const mapGroup = svg.append("g");



const zoom = d3.zoom()
    .scaleExtent([1, 8]) // zoom
    .translateExtent([[0, 0], [width, height]]) //limits the dragging area as to not get lost while trying to get a better look
    .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
    });

svg.call(zoom);

// 2. Set up projection
const projection = d3.geoMercator()
    .scale(150)
    .translate([width/2, height/1.4]);

const path = d3.geoPath().projection(projection);

// Store current state
let currentState = {
    tradeType: 'export',
    category: 'kaffe',
    year: '2021'  // Default year
};

// API endpoint mapping
const categoryEndpoints = {
    kaffe: '/api/onKaffe',
    maskiner: '/api/onMaskiner',
    levendeDyr: '/api/onLevendeDyr',
    medicin: '/api/onMedicin',
    tobak: '/api/onTobak'
};

// Category display names
const categoryDisplayNames = {
    kaffe: 'Kaffe',
    maskiner: 'Maskiner',
    levendeDyr: 'Levende dyr',
    medicin: 'Medicin',
    tobak: 'Tobak'
};

let geoDataWithValues;
let worldGeoData;
let rawCategoryData; // Store the raw data for filtering by year

// Function to fetch and process data for a category
async function fetchCategoryData(category) {
    try {
        const response = await fetch(categoryEndpoints[category]);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Get the correct field names based on category
        let exportField, importField;
        switch(category) {
            case 'levendeDyr':
                exportField = 'eksport_levende_dyr';
                importField = 'import_levende_dyr';
                break;
            default:
                exportField = `eksport_${category}`;
                importField = `import_${category}`;
        }

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

// Initialize the map
async function initializeMap() {
    try {
        // Fetch world GeoJSON data
        worldGeoData = await d3.json("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json");
        
        // Fetch initial category data
        await updateMapData();

        // Add event listeners for dropdowns
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

        // Populate year dropdown with available years
        updateYearDropdown();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Update year dropdown based on available data
function updateYearDropdown() {
    if (!rawCategoryData) return;

    const availableYears = [...new Set(rawCategoryData.map(d => d.årstal))]
        .sort((a, b) => b - a); // Sort years in descending order

    const yearSelect = d3.select("#year");
    
    // Save current selection
    const currentYear = yearSelect.property("value");
    
    // Update options
    yearSelect.selectAll("option")
        .data(availableYears)
        .join("option")
        .attr("value", d => d)
        .text(d => d);

    // Restore selection if it exists in new data, otherwise select latest year
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

// Update map with filtered data for selected year
async function updateMapWithYear() {
    // Filter data for selected year
    const yearData = rawCategoryData.filter(d => d.årstal.toString() === currentState.year);
    
    // Create data lookup map
    const dataMap = new Map(yearData.map(d => [d.land, {
        export: d.export,
        import: d.import,
        originalLand: d.originalLand,
        årstal: d.årstal
    }]));

    // Merge data with GeoJSON
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

function updateMap() {
    // Update map
    mapGroup.selectAll("path")
        .data(geoDataWithValues.features.filter(f => 
            f.properties.name !== "Bermuda" && 
            f.properties.name !== "Antarctica" &&
            f.properties.name !== "Seven seas (open ocean)"
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

// Tooltip functions
const tooltip = d3.select(".tooltip");

function mouseOver(event, d) {
    // Only show tooltip for actual countries
    if (d.properties.name === "Bermuda" || 
        d.properties.name === "Antarctica" || 
        d.properties.name === "Seven seas (open ocean)") {
        return;
    }

    d3.select(event.currentTarget)
        .attr("fill", "#7aa6c2")
        .attr("stroke", "#fff");
    
    const value = currentState.tradeType === 'export' ? d.properties.export : d.properties.import;
    const typeText = currentState.tradeType === 'export' ? 'Eksport' : 'Import';
    const categoryText = categoryDisplayNames[currentState.category];
    
    tooltip.style("opacity", 1)
        .html(`<strong>${d.properties.originalLand}</strong><br/>
               ${typeText} af ${categoryText}: ${value.toLocaleString()}.000 kr.<br/>
               År: ${currentState.year}`);
}

function mouseMove(event) {
    tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function mouseLeave(event, d) {
    d3.select(event.currentTarget)
        .attr("fill", "#1e6d8c")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.3)
        .attr("opacity", 1);
    tooltip.style("opacity", 0);
}

// Initialize the map when the script loads
initializeMap();