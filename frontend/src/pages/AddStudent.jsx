import { useState } from "react";
import { addStudent } from "../services/studentService";

function AddStudent() {

    // State to store form data
    const [student, setStudent] = useState({
        name: "",
        roll_number: "",
        email: "",
        branch: "",
        year_of_study: "",
        gender: ""
    });

    // Runs whenever user types
    function handleChange(event) {

        const { name, value } = event.target;

        setStudent({
            ...student,
            [name]: value
        });

    }

    // Runs when form is submitted
    async function handleSubmit(event) {

        event.preventDefault();

        try {

            await addStudent(student);

            alert("Student Added Successfully!");

            setStudent({
                name: "",
                roll_number: "",
                email: "",
                branch: "",
                year_of_study: "",
                gender: ""
            });

        }
        catch (error) {

            console.error(error);

            alert("Failed to Add Student");

        }

    }

    return (

        <div>

            <h1>Add Student</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <br />
                    <input
                        type="text"
                        name="name"
                        value={student.name}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <div>
                    <label>Roll Number</label>
                    <br />
                    <input
                        type="text"
                        name="roll_number"
                        value={student.roll_number}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <div>
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        name="email"
                        value={student.email}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <div>
                    <label>Branch</label>
                    <br />
                    <input
                        type="text"
                        name="branch"
                        value={student.branch}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <div>
                    <label>Year</label>
                    <br />
                    <input
                        type="number"
                        name="year_of_study"
                        value={student.year_of_study}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <div>
                    <label>Gender</label>

                    <br />

                    <select
                        name="gender"
                        value={student.gender}
                        onChange={handleChange}
                    >

                        <option value="">Select</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>

                    </select>

                </div>

                <br />

                <button type="submit">

                    Add Student

                </button>

            </form>

        </div>

    );

}

export default AddStudent;