<script>
  let SHEET_ID = '1RTN6vj9vdJyENBijvg1ahPqiYeUTNoct72oeQkGVHeQ';
  let SHEET_TITLE = 'Earth';
  let SHEET_RANGE_POLITICAL = 'A:G';
  let SHEET_RANGE_TERRAIN = 'A:H';
  let SHEET_RANGE_SELECTIONLOOKUP = 'A:I';
  let FULL_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=' + SHEET_TITLE + '&range=';

  // Function to fetch data from the spreadsheet and update shape colors
  function fetchData(sheetRange) {
    fetch(FULL_URL + sheetRange)
      .then((res) => res.text())
      .then((data) => {
        const jsonData = data.match(/google\.visualization\.Query\.setResponse\((.*?)\);/);
        if (jsonData) {
          const dataTable = JSON.parse(jsonData[1]).table;

          const shapes = document.getElementsByTagName('path');

          for (const shape of shapes) {
            const shapeId = shape.id;
            const row = dataTable.rows.find((row) => row.c[5].v === shapeId);

            if (row) {
              const colorIndex = sheetRange === SHEET_RANGE_POLITICAL ? 6 : 7;
              const color = row.c[colorIndex].v;
              shape.style.fill = color;
            } else {
              shape.style.fill = '#7d7d7d';
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  // Function to handle the path selection
  function selectPath(pathId) {
    // Get all path elements
    const paths = document.querySelectorAll('path');

    // Remove 'selected' class from all paths
    paths.forEach((path) => {
      path.classList.remove('selected');
    });

    // Add 'selected' class to the clicked path
    const selectedPath = document.getElementById(pathId);
    selectedPath.classList.add('selected');

    // Perform the lookup and update the selected path info
    lookupPathId(pathId, SHEET_RANGE_SELECTIONLOOKUP, function(lookupResult) {
      const selectedPathIdElement = document.getElementById('selectedProvinceOwner');
      selectedPathIdElement.textContent = lookupResult;
    });
  }

  // Function to perform lookup using pathId
  function lookupPathId(pathId, lookupRange, callback) {
    fetch(FULL_URL + lookupRange)
      .then((res) => res.text())
      .then((data) => {
        const jsonData = data.match(/google\.visualization\.Query\.setResponse\((.*?)\);/);
        if (jsonData) {
          const dataTable = JSON.parse(jsonData[1]).table;

          const row = dataTable.rows.find((row) => row.c[5].v === pathId);

          if (row) {
            const lookupResult = row.c[8].v; // Adjust the index as needed for the correct column
            callback(lookupResult); // Pass the lookup result to the callback function
          } else {
            callback('Not Found'); // PathId not found in lookup range
          }
        }
      })
      .catch((error) => {
        console.error('Error performing lookup:', error);
      });
  }

  // Add click event listener to each path
  const paths = document.querySelectorAll('path');
  for (const path of paths) {
    path.addEventListener('click', (event) => {
      const pathId = event.target.id;
      selectPath(pathId);
    });
  }

  // Attach event listener to the dropdown
  var dropdown = document.getElementById('mapmode');
  dropdown.addEventListener('change', function () {
    var selectedValue = dropdown.value;
    if (selectedValue === 'Political') {
      fetchData(SHEET_RANGE_POLITICAL);
    } else if (selectedValue === 'Terrain') {
      fetchData(SHEET_RANGE_TERRAIN);
    } else if (selectedValue === 'Debug') {
      console.log('Debug selected');
    }
  });
</script>
