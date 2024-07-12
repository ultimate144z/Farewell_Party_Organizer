const express = require("express");
const path = require("path");
const mysql = require("mysql");
const connection = require("./database");

// Amin changed
const bodyParser = require('body-parser');
let student_ID;
let name;
let email;
let studpassword;
let dietaryPreference;
let totalFamilyMembers;

// Amin changed end

const app = express();

// Amin changed
app.use(express.json());
// Amin changed end

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/AssignTask", (req, res) => {
    res.sendFile(path.join(__dirname, "AssignTask.html"));
});


app.get("/student_signup", (req, res) => {
    res.sendFile(path.join(__dirname, "student_signup.html"));
});

app.get("/teacher_signup", (req, res) => {
    res.sendFile(path.join(__dirname, "teacher_signup.html"));
});

app.get("/organizer_dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "organizer_dashboard.html"));
});

app.get("/Studentmainpage", (req, res) => {
    res.sendFile(path.join(__dirname, "studmain.html"));
});

app.get("/menusuggestion", (req, res) => {
    res.sendFile(path.join(__dirname, "menuvoting.html"));
});

app.get("/Performcesadding", (req, res) => {
    res.sendFile(path.join(__dirname, "performancevoting.html"));
});

app.get("/Announcementsdis", (req, res) => {
    res.sendFile(path.join(__dirname, "anouncementshowup.html"));
});

app.get("/voting", (req, res) => {
    res.sendFile(path.join(__dirname, "voting.html"));
});

app.get("/performance", (req, res) => {
    res.sendFile(path.join(__dirname, "performance.html"));
});

app.get("/menu", (req, res) => {
    res.sendFile(path.join(__dirname, "menu.html"));
});

app.get("/budget", (req, res) => {
    res.sendFile(path.join(__dirname, "budget.html"));
});

app.get("/ViewTask", (req, res) => {
    res.sendFile(path.join(__dirname, "ViewTask.html"));
});


app.post("/login", (req, res) => {
    const { username, password} = req.body;
    console.log('Received username:', username);
    console.log('Received password:', password);
    
    const studentQuery = 'SELECT * FROM student WHERE student_ID = ? AND Password = ?;';
    connection.query(studentQuery, [username, password], (err, studentResult) => {
        if (err) {
            console.error('Error executing student SQL query:', err);
            res.status(500).send('ERROR');
            return;
        }
        console.log('Student query result:', studentResult);
        
        // Check if student is found in student table
        if (studentResult.length > 0) {
            console.log('LOGIN SUCCESSFUL');

            // Amin changed

            // Extract student details from the first row
            const student = studentResult[0];
            student_ID = student.student_ID;
            name = student.Name;
            email = student.Email;
            studpassword = student.Password;
            dietaryPreference = student.DietaryPreference;
            totalFamilyMembers = student.TotalFamilyMembers;

            // Now you can use these variables outside the app.post function
            console.log('Outside app.post - Student ID:', student_ID);
            console.log('Outside app.post - Name:', name);
            console.log('Outside app.post - Email:', email);
            console.log('Outside app.post - Password:', studpassword);
            console.log('Outside app.post - Dietary Preference:', dietaryPreference);
            console.log('Outside app.post - Total Family Members:', totalFamilyMembers);

            res.redirect('/Studentmainpage');
            
            // Amin changed
            return;
        } 
        
        // If student is not found in student table, check organizer table
        const organizerQuery = 'SELECT * FROM organizer WHERE organizerID = ? AND Password = ?;';
        connection.query(organizerQuery, [username, password], (err, organizerResult) => {
            if (err) {
                console.error('Error executing organizer SQL query:', err);
                res.status(500).send('ERROR');
                return;
            }
            console.log('Organizer query result:', organizerResult);
                
            // Check if organizer is found in organizer table
            if (organizerResult.length > 0) {
                console.log('LOGIN SUCCESSFUL (as organizer)');
                res.redirect('/organizer_dashboard');
            } else {
                console.log('LOGIN FAILED');
                res.redirect('/?error=Incorrect%20password%20or%20username');
            }
        });
    });
});


app.post('/register-student', (req, res) => {
    const { studentId, fullName, email, password, dietaryPreference, totalFamilyMembers, volunteer } = req.body;
    const insertStudentQuery = 'INSERT INTO Student (student_ID, Name, Email, Password, DietaryPreference, TotalFamilyMembers) VALUES (?, ?, ?, ?, ?, ?)';

    connection.query(insertStudentQuery, [studentId, fullName, email, password, dietaryPreference, totalFamilyMembers], (err, result) => {
        if (err) {
            console.error('Error inserting student:', err);
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                res.status(400).send('Required foreign key does not exist');
            } else if (err.code === 'ER_DUP_ENTRY') {
                res.status(500).send('Student Already Registered');
            } else {
                res.status(500).send('Error registering student');
            }
        } else {
            console.log('Student inserted successfully');

            // Check if student has volunteered
            if (volunteer === '1') {
                const insertVolunteerQuery = 'INSERT INTO Volunteer (student_ID, task_ID) VALUES (?, NULL)'; 

                connection.query(insertVolunteerQuery, [studentId], (err, result) => {
                    if (err) {
                        console.error('Error inserting volunteer:', err);
                        res.status(500).send('Error registering volunteer');
                    } else {
                        console.log('Volunteer registered successfully');
                        res.send('Registered Successfully and added as a volunteer!');
                    }
                });
            } else {
                res.send('Registered Successfully!');
            }
        }
    });
});


app.post('/register-teacher', (req, res) => {
    console.log(req.body); 
    const { teacherId, name, numberOfFamilyMembers } = req.body;
    const query = "INSERT INTO TeacherRegistration (TeacherID, Name, NumberOfFamilyMembers) VALUES (?, ?, ?);";

    connection.query(query, [teacherId, name, numberOfFamilyMembers], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.error('Teacher already registered');
                res.status(400).send('Teacher already registered');
            } else {
                console.error('Error inserting data: ' + err);
                res.status(500).send('Teacher does not exist check your Teacher ID');
            }
        } else {
            console.log('Inserted data successfully');
            res.send('Teacher Registered Successfully!');
        }
    });
});

app.post('/vote-item', (req, res) => {
    console.log(req.body)
    const { itemID, studentID } = req.body;
    const query = 'INSERT INTO VotingRecords (student_ID, itemID) VALUES (?, ?)';

    connection.query(query, [studentID, itemID], (err, result) => {
        if (err) {
            console.error('Failed to record vote:', err);
            return res.status(500).send('Failed to record vote.');
        }
        res.send('Vote recorded successfully!');
    });
});


app.get("/performance-data", (req, res) => {
    const query = 'SELECT * FROM performancevoting';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Failed to fetch performance data:', err);
            return res.status(500).send('Failed to fetch performance data.');
        }
        // Send fetched data as JSON response
        res.json(results);
    });
});

app.get("/performance-data2", (req, res) => {
    const query = 'SELECT * FROM PERFORMANCES;';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Failed to fetch performance data:', err);
            return res.status(500).send('Failed to fetch performance data.');
        }
        // Send fetched data as JSON response
        res.json(results);
    });
});

app.get("/rehearsal", (req, res) => {
    const query = 'SELECT * FROM rehearsals;';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Failed to fetch performance data:', err);
            return res.status(500).send('Failed to fetch performance data.');
        }
        // Send fetched data as JSON response
        res.json(results);
    });
});

app.post('/add-performance', (req, res) => {
    const id = req.body.id;
    const timeslot = req.body.timeslot;
    const venue = req.body.venue;

    console.log(id);
    console.log(timeslot);
    console.log(venue);
    
    const query = 'INSERT INTO Performances (ID, Timeslot, Venue) VALUES (?, ?, ?)';

    connection.query(query, [id, timeslot, venue], (err, result) => {
        if (err) {
            console.error('Failed to add performance:', err);
            return res.status(500).send('Failed to add performance.');
        }
        res.send('Performance added successfully!');
    });
});

app.get('/top-items', (req, res) => {
    const query = 'SELECT * FROM ItemSuggest ORDER BY votes DESC LIMIT 3';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Failed to fetch top items:', err);
            return res.status(500).send('Failed to fetch top items.');
        }
        res.json(results);
        // console.log(results);
    });
});


app.post('/add-to-final-menu', (req, res) => {
    const { itemID, price } = req.body; // Assuming price is also sent from the client
    const query = "INSERT INTO FinalMenu (itemID, name, price) SELECT itemID, name, ? FROM MenuItem WHERE itemID = ?";

    connection.query(query, [price, itemID], (err, result) => {
        if (err) {
            console.error('Failed to add item to Final Menu:', err);
            res.status(500).send('Failed to add item to Final Menu.');
        } else {
            res.send('Item added to Final Menu successfully!');
        }
    });
});

app.post('/add-item', (req, res) => {
    const name = req.body.name;
    const price = req.body.price;
    const addItemQuery = 'INSERT INTO MenuItem (name, price) VALUES (?, ?)';

    connection.query(addItemQuery, [name, price], (err, result) => {
        if (err) {
            console.error('Failed to add new item:', err);
            return res.status(500).send('Failed to add new item.');
        }
        console.log(result.insertId);
        const newItemId = result.insertId;
        const addToFinalMenuQuery = 'INSERT INTO FinalMenu (itemID, name, price) VALUES (?, ?, ?)';  
        connection.query(addToFinalMenuQuery, [newItemId, name, price], (err, result) => {
            if (err) {
                console.error('Failed to add item to Final Menu:', err);
                return res.status(500).send('Failed to add item to Final Menu.');
            }
            res.send('New dish added successfully and added to Final Menu!');
        });
    });
});

// API to fetch category based on organizerID
app.get('/get-category', (req, res) => {
    const { organizerID } = req.query;
    const sql = 'SELECT Category FROM Organizer WHERE organizerID = ?';
    connection.query(sql, [organizerID], (err, result) => {
        if (err) return res.status(500).send('Failed to fetch category');
        if (result.length === 0) return res.status(404).send('Organizer not found');
        res.json({ category: result[0].Category });
    });
});

// API to fetch budget details
app.get('/get-budget-details', (req, res) => {
    const { category } = req.query;
    const sql = 'SELECT allocated_amount, spent_amount FROM budget WHERE category = ?';
    connection.query(sql, [category], (err, result) => {
        if (err) return res.status(500).send('Failed to fetch budget details');
        if (result.length === 0) return res.status(404).send('Budget details not found');
        res.json({
            allocatedAmount: result[0].allocated_amount,
            spentAmount: result[0].spent_amount
        });
    });
});

app.post('/submit-budget', (req, res) => {
    const category = req.body.category;
    const newAllocatedAmount = (req.body.newAllocatedAmount);
    const newSpentAmount = (req.body.spentAmount);




    console.log(category);
    console.log(newAllocatedAmount);
    console.log(newSpentAmount);

    // if (newSpentAmount > newAllocatedAmount) {
    //     return res.status(400).send("Spent amount cannot exceed allocated amount.");
    // }

    const sql = 'UPDATE budget SET allocated_amount = ?, spent_amount = ? WHERE category = ?';
    connection.query(sql, [newAllocatedAmount, newSpentAmount, category], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to update the budget');
        }
        res.send('Budget updated successfully');
    });
});



// Amin changed
function getMenuItems(callback) {
    // Query to select menu items from the database
    const query = 'SELECT it.name,m.price,it.votes FROM ItemSuggest it inner join MenuItem m on m.itemID=it.itemID';

    // Execute the query
    connection.query(query, (error, results) => {
        if (error) {
            // Handle error
            console.error('Error fetching menu items:', error);
            callback(error, null);
            return;
        }
        // Return the results
        callback(null, results);
    });
}

app.get('/menushowup', (req, res) => {
    getMenuItems((error, menuItems) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(menuItems);
    });
});


app.post('/votercheck', (req, res) => {
    const itemname = req.body.itemId; // Retrieve the itemId from the request body
    console.log('Inserted data successfully:', itemname);
    let itemID;

    const query = 'SELECT * FROM DoneSuggest WHERE student_ID = ?';
    connection.query(query, [student_ID], (error, results, fields) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            return;
        }

        if (results.length > 0) {
            const message = `You have already voted for an item`;
            res.json({ message: message });
            return;
        }

        console.log('Executing else statement');
        const message = `Your vote has been registered`;

        const query1 = 'SELECT itemID FROM ItemSuggest WHERE name = ?';
        connection.query(query1, [itemname], (error, idofmenu, fields) => {
            if (error) {
                console.error('Error retrieving itemID:', error);
                res.status(500).json({ error: 'Error retrieving itemID' });
                return;
            }

            if (idofmenu.length > 0) {
                itemID = idofmenu[0].itemID;
                console.log('Found the itemID:', itemID);

                const updateQuery = 'UPDATE ItemSuggest SET votes = votes + 1 WHERE itemID = ?';
                connection.query(updateQuery, [itemID], (error, results, fields) => {
                    if (error) {
                        console.error('Error updating votes:', error);
                        res.status(500).json({ error: 'Error updating votes' });
                        return;
                    }

                    else {
                        const query = 'INSERT INTO DoneSuggest (itemID, student_ID) VALUES (?, ?)';
                        connection.query(query, [itemID, student_ID], (error, results, fields) => {
                            if (error) {
                                console.error('Error updating votes:', error);
                                res.status(500).json({ error: 'Error updating votes' });
                                return;
                            }
                            console.log('student votes updated successfully.');
                        });

                    }

                    console.log('Votes updated successfully.');
                    res.json({ message: message });
                });
            } else {
                console.log('Item not found.');
                res.status(404).json({ error: 'Item not found' });
            }
        });
    });
});

app.post('/performvotercheck', (req, res) => {
    const performid = req.body.performid; // Retrieve the itemId from the request body
    console.log('Inserted data successfully:', performid);


    const query = 'SELECT * FROM DonePerformSugest WHERE student_ID = ?';
    connection.query(query, [student_ID], (error, results, fields) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            return;
        }

        if (results.length > 0) {
            const message = `You have already voted for an item`;
            res.json({ message: message });
            return;
        }

        console.log('Executing else statement');
        const message = `Your vote has been registered`;

        const updateQuery = 'UPDATE PerformanceVoting SET votes = votes + 1 WHERE ID = ?';
        connection.query(updateQuery, [performid], (error, results, fields) => {
            if (error) {
                console.error('Error updating votes:', error);
                res.status(500).json({ error: 'Error updating votes' });
                return;
            }

            else {
                const query = 'INSERT INTO DonePerformSugest (ID, student_ID) VALUES (?, ?)';
                connection.query(query, [performid, student_ID], (error, results, fields) => {
                    if (error) {
                        console.error('Error updating votes:', error);
                        res.status(500).json({ error: 'Error updating votes' });
                        return;
                    }
                    console.log('student votes updated successfully.');
                });

            }
            res.json({ message: message });
            console.log('Votes updated successfully.');
            });
        });
});

app.post ('/addperformance',(req,res)=>{

    const type = req.body.type;
    const duration = req.body.duration;
    const requirements = req.body.requirements;

    console.log(type);
    console.log(duration);
    console.log(requirements);

    const query = 'INSERT INTO PerformanceVoting (Type, Duration, SpecialRequirements) VALUES (?, ?,?)';
    connection.query(query, [type, duration,requirements], (error, results, fields) => {
        if (error) {
            console.error('Error updating votes:', error);
            res.status(500).json({ error: 'Error updating votes' });
            return;
        }
        console.log('student votes updated successfully.');
    });
    
    const message="Your data has been posted";
    res.json({message: message});
});

// Endpoint to fetch announcements
app.get('/fetchAnnouncements', (req, res) => {

    const query = 'SELECT description FROM Announcement';
    connection.query(query, [student_ID], (error, results, fields) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            return;
        }

        // Initialize an empty list to store announcements
        const announcements = [];
        console.log( results);

        // Iterate through each row of results and append the description to the list
        results.forEach(row => {
            console.log( row.description);
            announcements.push(row.description);
        });

        console.log( announcements);

        res.json(announcements);
        return;
    });
});

app.get('/loadMenu', (req, res) => {
    // Send the menu.html file when this endpoint is requested
    res.sendFile(path.join(__dirname, "menuvoting.html"));
});

// const performances = [
//     { id: 1, type: 'Dance', duration: 60, specialRequirements: 'Large stage', votes: 0 },
//     { id: 2, type: 'Comedy', duration: 30, specialRequirements: 'Microphone', votes: 0 },
//     { id: 3, type: 'Drama', duration: 90, specialRequirements: 'Props for set', votes: 0 },
//     { id: 4, type: 'Poetry', duration: 20, specialRequirements: 'Quiet room', votes: 0 },
//     { id: 5, type: 'Jazz Band', duration: 45, specialRequirements: 'Sound system', votes: 0 },
//     { id: 6, type: 'Magic Show', duration: 30, specialRequirements: 'No special requirements', votes: 0 },
//     { id: 7, type: 'Lecture', duration: 60, specialRequirements: 'Projector and screen', votes: 0 },
//     { id: 8, type: 'Film Screening', duration: 120, specialRequirements: 'Dark room, chairs', votes: 0 },
//     { id: 9, type: 'Live Painting', duration: 40, specialRequirements: 'Natural light', votes: 0 },
//     { id: 10, type: 'Folk Music', duration: 50, specialRequirements: 'Outdoor setting', votes: 0 },
// ];


// Endpoint to fetch performances
app.get('/fetchPerformancesDetails', (req, res) => {

    const query = 'SELECT * FROM PerformanceVoting';
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            return;
        }

        console.log( results);

        res.json(results);
        return;
    });
});


app.post('/assignTask', (req, res) => {
    const { volunteerId, taskDescription, taskStatus } = req.body;

    if (!volunteerId || !taskDescription || !taskStatus) {
        return res.status(400).send({ error: 'Volunteer ID, Task Description, and Task Status are required' });
    }

    // Step 1: Insert the new task into the Task table
    const insertTaskQuery = 'INSERT INTO Task (task_description, task_status) VALUES (?, ?)';
    connection.query(insertTaskQuery, [taskDescription, taskStatus], (err, taskResult) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).send({ error: 'Error inserting task' });
        }
        
        // Step 2: Get the ID of the newly inserted task
        const taskId = taskResult.insertId;

        // Step 3: Assign this task to the volunteer
        const insertAssignedTaskQuery = 'INSERT INTO AssignedTask (volunteer_ID, task_ID) VALUES (?, ?)';
        connection.query(insertAssignedTaskQuery, [volunteerId, taskId], (err, assignedTaskResult) => {
            if (err) {
                console.error('Error assigning task to volunteer:', err);
                return res.status(500).send({ error: 'Error assigning task to volunteer' });
            }
            console.log('Task assigned successfully');
            res.send({ message: 'Task assigned successfully' });
        });
    });
});

app.get('/api/volunteers/without-tasks', (req, res) => {
    const query = `SELECT v.volunteer_ID, v.student_ID
                   FROM Volunteer v
                   LEFT JOIN AssignedTask at ON v.volunteer_ID = at.volunteer_ID
                   WHERE at.volunteer_ID IS NULL;`;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send('Failed to fetch volunteers without tasks');
        res.json(results);
    });
});

app.get('/api/volunteers/with-tasks', (req, res) => {
    const query = `SELECT at.assignment_ID, at.volunteer_ID, t.task_description, t.task_status
                   FROM AssignedTask at
                   JOIN Task t ON at.task_ID = t.task_ID;`;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send('Failed to fetch volunteers with tasks');
        res.json(results);
    });
});



const port = 8000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
