
// Stores all uploaded courses
let courses = [];

// Stores courses after filtering
let filteredCourses = [];


class Course {

    constructor(courseData) {

        // Store course information
        this.id = courseData.id ?? "Unknown";
        this.title = courseData.title ?? "Untitled";
        this.department = courseData.department ?? "Unknown";
        this.year = courseData.year ?? "Unknown";
        this.semester = courseData.semester ?? "";
        this.credits = courseData.credits ?? "Unknown";

    }

    // Getters

    getId() {
        return String(this.id);
    }

    getTitle() {
        return String(this.title);
    }

    getDepartment() {
        return String(this.department);
    }

    getYear() {
        return String(this.year);
    }

    getSemester() {
        return String(this.semester);
    }

    getCredits() {
        return String(this.credits);
    }


    // Return all course information as a string

    getDetails() {

        return `Course ID: ${this.getId()}
        Title: ${this.getTitle()}
        Department: ${this.getDepartment()}
        Year: ${this.getYear()}
        Semester: ${this.getSemester() || "Not specified"}
        Credits: ${this.getCredits()}
        `.trim();

    }

}

// Find the file input element
const fileInput = document.getElementById("file-input");


// Listen for a file selection
fileInput.addEventListener("change", function() {

    const file = fileInput.files[0];

    // Check if a file was selected
    if (!file) {
        return;
    }

    // Check if the file is empty
    if (file.size === 0) {

        showError("The selected file is empty.");
        return;

    }

    // Create a FileReader object
    const reader = new FileReader();


    // What happens when the file has been read
    reader.onload = function(event) {

        try {

            // Convert JSON text into JavaScript objects
            const data = JSON.parse(event.target.result);


            // Make sure the JSON contains an array
            if (!Array.isArray(data)) {

                throw new Error(
                    "The JSON file must contain an array of courses."
                );

            }

            // Make sure every entry is a valid object
            if (data.some(courseData =>
                courseData === null ||
                typeof courseData !== "object" ||
                Array.isArray(courseData)
            )) {

                throw new Error(
                    "The JSON file contains an invalid course entry."
                );

            }

            // Create a Course object for every entry
            courses = data.map(courseData => {

                return new Course(courseData);

            });

            // Clear previous error messages
            showError("");

            // Reset all dropdown selections
            document.getElementById("department-filter").value = "";
            document.getElementById("year-filter").value = "";
            document.getElementById("semester-filter").value = "";
            document.getElementById("credits-filter").value = "";
            document.getElementById("sort-filter").value = "";

            // Reset the details panel
            document.getElementById("course-details").textContent =
                "Select a course to see its details.";

            // Populate dropdowns using uploaded data
            populateFilters();

            // Initially display all courses
            filterCourses();
        }

        catch (error) {

            // Display an error message
            showError("Error loading file: " + error.message);

            // Clear course data
            courses = [];
            filteredCourses = [];

            // Clear the course list
            document.getElementById("course-list").innerHTML = "";

            document.getElementById("course-count").textContent =
                "No courses loaded.";

            document.getElementById("course-details").textContent =
                "No course details available.";

        }

    };

    // Handle file reading errors
    reader.onerror = function() {

        showError("Unable to read the selected file.");

    };

    // Read the selected file as text
    reader.readAsText(file);

});

function showError(message) {

    document.getElementById("error-message").textContent = message;

}

function displayCourses(courseArray) {

    const courseList = document.getElementById("course-list");

    const courseCount = document.getElementById("course-count");


    // Remove previous courses
    courseList.innerHTML = "";

    // Update the number of courses displayed
    courseCount.textContent =
        courseArray.length + " courses found.";

    // Go through each course
    courseArray.forEach(function(course) {

        // Create a new list item
        const listItem = document.createElement("li");


        // Display course ID and title
        listItem.textContent =
            course.getId() + " - " + course.getTitle();


        // Make the course clickable
        listItem.addEventListener("click", function() {

            displayCourseDetails(course);

        });


        // Add the course to the HTML list
        courseList.appendChild(listItem);

    });

}

function displayCourseDetails(course) {

    const details = document.getElementById("course-details");


    // Display all course information
    details.textContent = course.getDetails();

}

function populateFilters() {

    // Get the dropdown elements
    const departmentFilter =
        document.getElementById("department-filter");

    const yearFilter =
        document.getElementById("year-filter");

    const semesterFilter =
        document.getElementById("semester-filter");

    const creditsFilter =
        document.getElementById("credits-filter");


    // Get unique values for a particular property
    function getUniqueValues(property) {

        return [...new Set(

            courses

                // Get the selected property from each course
                .map(course => course[property])

                // Remove missing values
                .filter(value =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                )

                // Convert values into strings
                .map(value => String(value)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })
        );

    }


    // Get the unique values from the courses
    const departments = getUniqueValues("department");

    const years = getUniqueValues("year");

    const semesters = getUniqueValues("semester");

    const credits = getUniqueValues("credits");


    // Function to add options to a dropdown
    function fillDropdown(dropdown, values) {

        // Keep the first option (All...)
        dropdown.length = 1;


        // Add each unique value
        values.forEach(function(value) {

            const option = document.createElement("option");

            option.value = value;

            option.textContent = value;

            dropdown.appendChild(option);

        });

    }

    // Populate all four dropdowns
    fillDropdown(departmentFilter, departments);

    fillDropdown(yearFilter, years);

    fillDropdown(semesterFilter, semesters);

    fillDropdown(creditsFilter, credits);

}

function filterCourses() {

    // Get the selected values from each dropdown
    const department =
        document.getElementById("department-filter").value;

    const year =
        document.getElementById("year-filter").value;

    const semester =
        document.getElementById("semester-filter").value;

    const credits =
        document.getElementById("credits-filter").value;


    // Use filter() to find matching courses
    filteredCourses = courses.filter(function(course) {


        // Check department
        const matchesDepartment =
            department === "" ||
            course.getDepartment() === department;


        // Check year
        const matchesYear =
            year === "" ||
            course.getYear() === year;


        // Check semester
        const matchesSemester =
            semester === "" ||
            course.getSemester() === semester;


        // Check credits
        const matchesCredits =
            credits === "" ||
            course.getCredits() === credits;


        // All selected conditions must match
        return (
            matchesDepartment &&
            matchesYear &&
            matchesSemester &&
            matchesCredits
        );

    });


    // Sort and display the filtered courses
    sortAndDisplayCourses();

}

function sortCourses(courseArray, sortBy) {

    // Make a copy of the array
    const sortedCourses = [...courseArray];


    // Sort alphabetically by title
    if (sortBy === "title") {

        sortedCourses.sort((a, b) =>

            a.getTitle().localeCompare(b.getTitle())

        );

    }


    // Sort by course ID
    else if (sortBy === "id") {

        sortedCourses.sort((a, b) =>

            a.getId().localeCompare(
                b.getId(),
                undefined,
                { numeric: true }
            )

        );

    }


    // Sort chronologically by semester
    else if (sortBy === "semester") {

        // Academic season order
        const semesterOrder = {

            "Winter": 1,
            "Spring": 2,
            "Summer": 3,
            "Fall": 4

        };


        // Convert semester into a sortable number
        function getSemesterValue(course) {

            const semester = course.getSemester();

            // Check for missing semester
            if (!semester) {
                return null;
            }


            // Match the required semester format
            const match = semester.match(
                /^(Winter|Spring|Summer|Fall) (\d{4})$/
            );


            // Return null if the semester is invalid
            if (!match) {
                return null;
            }


            const season = match[1];

            const year = Number(match[2]);


            // Combine year and season into one number
            return year * 10 + semesterOrder[season];

        }


        // Use sort() to compare semesters
        sortedCourses.sort((a, b) => {

            const valueA = getSemesterValue(a);

            const valueB = getSemesterValue(b);


            // Both semesters are missing or invalid
            if (valueA === null && valueB === null) {
                return 0;
            }


            // Missing or invalid semesters go last
            if (valueA === null) {
                return 1;
            }

            if (valueB === null) {
                return -1;
            }


            // Sort chronologically
            return valueA - valueB;

        });

    }


    return sortedCourses;

}

function sortAndDisplayCourses() {

    // Get the selected sorting option
    const sortBy =
        document.getElementById("sort-filter").value;


    // Sort the filtered courses
    const sortedCourses = sortCourses(filteredCourses, sortBy);


    // Display the sorted courses
    displayCourses(sortedCourses);

}

// Department filter
document.getElementById("department-filter")
    .addEventListener("change", filterCourses);


// Year filter
document.getElementById("year-filter")
    .addEventListener("change", filterCourses);


// Semester filter
document.getElementById("semester-filter")
    .addEventListener("change", filterCourses);


// Credits filter
document.getElementById("credits-filter")
    .addEventListener("change", filterCourses);


// Sorting dropdown
document.getElementById("sort-filter")
    .addEventListener("change", sortAndDisplayCourses);
