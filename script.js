/* Generated api key for NYT API for top stories in World, US, Health, and 
   Tech */
const KEY = "jtu3Ulo0TrfpeuLQ94KAlqdVzfMDfYoM";

const worldURL = `https://api.nytimes.com/svc/topstories/v2/world.json?
api-key=${KEY}`;
const usURL = `https://api.nytimes.com/svc/topstories/v2/us.json?
api-key=${KEY}`;
const healthURL = `https://api.nytimes.com/svc/topstories/v2/health.json?
api-key=${KEY}`;
const techURL = `https://api.nytimes.com/svc/topstories/v2/technology.json?
api-key=${KEY}`;

// Sections/subsections of interest
const allPossibleSections = ["world", "us", "health", "tech"];
const allPossibleSubsections = [
    "africa", "americas", "asia", "australia", "canada", "europe",
    "middleeast", "politics", "business", "policy", "live", "mind",
    "family", "dealbook", "economy", "energy-environment", "media",
    "tech", "smallbusiness"
];

// Arrays to be populated with articles data
var sections = [];
var subsections = [];
var createdDates = [];


/**
 * Fetch data from URLs
 */
async function fetchData() {
    await Promise.all([
        fetch(worldURL),
        fetch(usURL),
        fetch(healthURL),
        fetch(techURL)
    ]).then(function (responses) {
        // Get a JSON object from each of the responses
        return Promise.all(responses.map(function (response) {
            return response.json();
        }));
    }).then(function (data) {
        data.forEach(arr => {
            appendDataToHTML(arr.results,
                document.getElementsByClassName("articles").length);
        });

        // Instead of fetching again, data will be used from previous fetch
        sessionStorage.setItem("sections", sections.join(","));
        sessionStorage.setItem("subsections", subsections.join(","));
        sessionStorage.setItem("createddates", createdDates.join(","));
    }).catch(function (error) {
        alert(`Error occurred, please try to re-open page`);
        console.log("ERR-" + error);
    });
}


/**
 * Populates tracking arrays and appends to HTML document
 * @param {object} data_arr - object of data results
 * @param {number} i - number of articles appended to HTML document
 */
function appendDataToHTML(data_arr, i) {
    var articlesNode = document.getElementById("articles_cont");
    var res = "";
    var minDate = new Date();
    var tmp = i;

    // Only appending articles that fit into specified sections/subsections
    data_arr.forEach(article => {
        if (allPossibleSections.includes(article.section) ||
            allPossibleSubsections.includes(article.subsection)) {

            // Setting personaltech to be same as tech subsection
            if (article.subsection == "personaltech") {
                subsections.push("tech");
            } else {
                subsections.push(article.subsection);
            }

            // Appending to data arrays
            sections.push(article.section);
            createdDates.push(article.created_date);

            // Create Date obj using article date string
            var article_date = new Date(article.created_date);

            // Update min date
            if (article_date < minDate) {
                minDate = article_date;
            }

            var author;

            if (article.byline == "") {
                // Author not specified
                author = "By: &ltAuthor Unknown&gt";
            } else {
                // Author specified
                author = `${article.byline.substring(0, 2)}: 
                ${article.byline.substring(3)}`;
            }

            // Create article element and append to result string
            res += `<div id='article${i}' class='articles'><h3><a id=
            'title${i}' class='title' href=${article.url}>${article.title}</a>
            </h3><p id='author${i}' class='authors'>${author}</p><p 
            class='abstracts'>${article.abstract}</p></div>`;

            // Update cnt (increment to keep track of each article element)
            i += 1;
        }
    });

    // Update document
    articlesNode.innerHTML += res;

    i = tmp;

    // Add images to each article container
    data_arr.forEach(article => {
        if (allPossibleSections.includes(article.section) ||
            allPossibleSubsections.includes(article.subsection)) {

            if (article.multimedia != null) {
                var bgi = article.multimedia[0].url;
                var articleElem = document.getElementById(`article${i}`);

                articleElem.style.backgroundImage = `url(${bgi})`;
            }

            i += 1;
        }
    });

    // Setting new min date, if it is less than current min date
    formatMinDate(minDate,
        new Date(`${document.getElementById("startdate").value} 00:00:00`));
}


/**
 * Comparing two date and setting a min date
 * @param {date} minDate - new date to compare
 * @param {date} date - current min date
 */
function formatMinDate(minDate, date) {
    if (minDate < date) {
        var formattedMinDate = getFormattedDate(minDate);

        document.getElementById("startdate").min =
            document.getElementById("enddate").min =
            document.getElementById("startdate").value = formattedMinDate;
    }
}


/**
 * Displaying/hiding filter bar
 */
function showFilterDiv() {
    var filterBar = document.getElementById("filter_bar_cont");
    var button = document.getElementById("display_filter_button");

    if (filterBar.style.display === "none") {
        filterBar.style.display = "block";
        button.innerHTML = "Hide Filters";
    } else {
        filterBar.style.display = "none";
        button.innerHTML = "Show Filters";
    }
}


/**
 * Uncheck/check all boxes
 * @param {string} source - name of id for check all box
 * @param {string} boxes - name of class name for all check all results
 */
function checkAll(source, boxes) {
    var checked = document.getElementById(source).checked;
    var all_checkboxes = document.getElementsByClassName(boxes);

    for (var checkbox in all_checkboxes) {
        all_checkboxes[checkbox].checked = checked;
    }
}


/**
 * Checking if check all option selected
 * @param {string} source - name of id for check all box
 * @param {string} boxes - name of class name for all check all results
 */
function checkAllSelected(source, boxes) {
    var checkBoxAll = document.getElementById(source);

    if (checkBoxAll.checked) {
        // Reset
        checkBoxAll.checked = false;
    } else {
        var all_checkboxes = document.getElementsByClassName(boxes);
        var cnt = 0;

        for (var checkbox in all_checkboxes) {
            if (all_checkboxes[checkbox].checked &&
                all_checkboxes[checkbox].tagName == "INPUT") {
                cnt += 1;
            }
        }

        // All other opts selected, so also check "check all" option
        if (cnt === document.getElementsByClassName(boxes).length) {
            checkBoxAll.checked = true;
        }
    }
}


/**
 * Returning all chosen filters (e.g., section, subsection, dates)
 * @returns {array} Array of chosen filters
 */
function getChosenFilters() {
    if (new Date(document.getElementById("startdate").value) >
        new Date(document.getElementById("enddate").value)) {
        alert("Start date more than end date");
        reset();
        return [];
    } else {
        var selected = [];
        var inputs = document.querySelectorAll(
            "input[type='checkbox']:checked");

        inputs.forEach(input => {
            if (input.value != "checkAll") {
                selected.push(input.value);
            }
        });

        selected.push(document.getElementById("startdate").value);
        selected.push(document.getElementById("enddate").value);

        return selected;
    }
}


/**
 * Returns array of articles that have been filtered
 * @param {number} len - number of article elements
 * @param {array} filteredOpts - array of chosen filters
 * @returns array of filtered articles
 */
function getFilteredArticles(len, filteredOpts) {
    var filteredArticles = [];
    var startDate = new Date(document.getElementById("startdate").value);
    var endDate = new Date(document.getElementById("enddate").value);

    // Dates are set back a day, add 1 to fix this
    startDate = new Date(startDate.setDate(startDate.getDate() + 1));
    endDate = new Date(endDate.setDate(endDate.getDate() + 1));

    for (var i = 0; i < len; i++) {
        var date = new Date(createdDates[i].split('T')[0]);
        date = new Date(date.setDate(date.getDate() + 1));

        if (((filteredOpts.includes(sections[i]) ||
            filteredOpts.includes(subsections[i])) &&
            (date >= startDate && date <= endDate)) ||
            (filteredOpts.length == 2 &&
                (date >= startDate && date <= endDate))) {
            filteredArticles.push(i);
        }
    }
    return filteredArticles;
}


/**
 * Displaying articles that match the chosen filter options 
 */
function showFilteredArticles() {
    var len = document.getElementsByClassName("articles").length;
    var filteredOpts = [];

    try {
        filteredOpts = getChosenFilters();
    } catch (err) {
        alert(err);
    }

    if (filteredOpts.length != 0) {
        var filteredArticles = getFilteredArticles(len, filteredOpts);

        for (var i = 0; i < len; i++) {
            if (filteredArticles.includes(i)) {
                document.getElementById(`article${i}`).style.display = "block";
            } else {
                document.getElementById(`article${i}`).style.display = "none";
            }
        }
    } else {
        reset();
    }
}


/**
 * Displaying all articles and unselecting filter options
 */
function reset() {
    var startDate = document.getElementById("startdate");
    var endDate = document.getElementById("enddate");
    var allSelCheckboxes = document.getElementsByClassName("sel_sections");
    var allSelSubCheckboxes = document.getElementsByClassName(
        "sel_subsections");
    var articles = document.getElementsByClassName("articles");

    startDate.value = startDate.min;
    endDate.value = endDate.max;

    if (document.getElementById("check").checked) {
        document.getElementById("check").checked = false;
    }

    if (document.getElementById("sub_check").checked) {
        document.getElementById("sub_check").checked = false;
    }

    Array.from(allSelCheckboxes).forEach(elem => elem.checked = false);
    Array.from(allSelSubCheckboxes).forEach(elem => elem.checked = false);
    Array.from(articles).forEach(elem => elem.style.display = "block");

    document.getElementById("search_bar").value = "";
}


/**
 * Checking if a string is include within another string
 * @param {string} haystack - string value
 * @param {string} needle - substring to search
 * @returns {boolean} - true if value is found otherwise false
 */
function valIncludesStr(needle, haystack) {
    if (haystack.includes(needle)) {
        return true;
    }

    return false;
}


/**
 * Checking if string matches within author name(s)
 * @param {string} str - substring, search bar value
 * @param {array} authors - name of author(s)
 * @returns {boolean} - true if author matches str substring 
 */
function authorMatch(str, authors) {
    for (var i = 0; i < authors.length; i++) {
        if (str.split(" ").some(element => authors[i].includes(element))) {
            return true;
        }
    }

    return false;
}


/**
 * 
 * @param {string} str - search bar value
 * @param {string} val - abstract or title
 * @returns {boolean} true if str is found in val, false otherwise
 */
function strMatch(str, val) {
    return removeStopWords(str).some(element => val.includes(element));
}


/**
 * Filtering articles based on value in search bar
 */
function search() {
    if (document.getElementById("search_bar").checkValidity()) {
        var str = document.getElementById("search_bar").value.toLowerCase();
        var abstracts = document.getElementsByClassName("abstracts");
        var articles = document.getElementsByClassName("articles");
        var authors = document.getElementsByClassName("authors");
        var titles = document.getElementsByClassName("title");
        var filteredOpts = getChosenFilters();
        var regex = /[^a-zA-Z0-9\s+]*/g;

        if (filteredOpts.length != 0) {
            var visItems = getFilteredArticles(articles.length,
                getChosenFilters());

            for (var i = 0; i < articles.length; i++) {
                if (visItems.includes(i) &&
                    (authorMatch(str, (authors[i].innerHTML.toLowerCase().
                        substring(3)
                        .split(/,|\sand/g).map(author => author.trim()))) ||
                        strMatch(str, titles[i].innerHTML.toLowerCase()) ||
                        strMatch(str, abstracts[i].innerHTML.toLowerCase().
                            replace(regex, "")))) {
                    articles[i].style.display = "block";
                } else {
                    articles[i].style.display = "none";
                }
            }
        }
    } else {
        document.getElementById("search_bar").reportValidity();
    }
}


/**
 * Formatting Date as a string
 * @param {date} date - date object  
 * @returns {string} date formatted as string 
 */
function getFormattedDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0
    var yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return yyyy + '-' + mm + '-' + dd;
}


/**
 * Setup when page is loaded
 */
window.onload = function () {
    var today = getFormattedDate(new Date());

    // Fetch data when first opened or when an hour has passed by
    if (sessionStorage.getItem("key") == null ||
        (sessionStorage.getItem("time") != null &&
            (new Date().getTime() - sessionStorage.getItem("time")) >= 3600000)
    ) {
        document.getElementById("startdate").setAttribute("min", today);
        document.getElementById("enddate").setAttribute("min", today);

        document.getElementById("startdate").setAttribute("max", today);
        document.getElementById("enddate").setAttribute("max", today);

        document.getElementById("startdate").setAttribute("value", today);
        document.getElementById("enddate").setAttribute("value", today);

        fetchData();

        // Track date/time when session last fetch data
        sessionStorage.setItem("time", new Date().getTime());

        // Wait to data to load before setting items 
        setTimeout(() => {
            sessionStorage.setItem("startDate",
                document.getElementById("startdate").min);
            sessionStorage.setItem("key",
                document.getElementById("articles_cont").innerHTML);
        }, 9000);
    } else {
        var start = sessionStorage.getItem("startDate");

        // Resetting dates
        document.getElementById("startdate").setAttribute("min", start);
        document.getElementById("startdate").setAttribute("max", today);
        document.getElementById("startdate").setAttribute("value", start);

        document.getElementById("enddate").setAttribute("min", start);
        document.getElementById("enddate").setAttribute("max", today);
        document.getElementById("enddate").setAttribute("value", today);

        sections = sessionStorage.getItem("sections").split(",");
        subsections = sessionStorage.getItem("subsections").split(",");
        createdDates = sessionStorage.getItem("createddates").split(",");

        //Resetting articles
        document.getElementById("articles_cont").innerHTML =
            sessionStorage.getItem("key");
    }
}