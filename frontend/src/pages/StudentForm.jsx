import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { studentApi } from "../api/studentApi";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  roll_number: z.string().min(1, "Roll number is required").max(50),
  email: z.string().email("Invalid email address"),
  branch: z.string().min(1, "Branch/Department is required").max(100),
  year_of_study: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().min(1, "Year must be at least 1").max(5, "Year cannot exceed 5")
  ),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Select a valid gender" }),
  }),
});

function StudentForm({ isEditing = false }) {
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const navigate = useNavigate();
  const { id } = useParams();

  const activeSessionId = localStorage.getItem("activeSessionId");

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { gender: "Male" }
  });

  useEffect(() => {
    if (!activeSessionId) {
      navigate("/students");
    }
    
    const fetchStudent = async () => {
      if (isEditing && id) {
        try {
          const student = await studentApi.getStudentById(id);
          reset({
            name: student.name,
            roll_number: student.roll_number,
            email: student.email,
            branch: student.branch,
            year_of_study: student.year_of_study,
            gender: student.gender,
          });
        } catch (err) {
          setApiError(err.detail || "Failed to load student details");
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchStudent();
  }, [isEditing, id, reset, navigate, activeSessionId]);

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      if (isEditing) {
        await studentApi.updateStudent(id, data);
      } else {
        await studentApi.createStudent({
          ...data,
          allocation_session_id: parseInt(activeSessionId, 10)
        });
      }
      navigate("/students");
    } catch (err) {
      setApiError(err.detail || `Failed to ${isEditing ? 'update' : 'create'} student.`);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading student data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/students" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Student Profile" : "Enroll New Student"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isEditing ? "Update existing student information." : "Add a new student to the currently active allocation session."}
          </p>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
          <div className="text-sm text-red-700">{apiError}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden p-6 sm:p-8 transition-colors">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                {...register("name")}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.name ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="e.g. Rahul Kumar"
              />
              {errors.name && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
              <input
                type="text"
                {...register("roll_number")}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.roll_number ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="e.g. CS25F102"
              />
              {errors.roll_number && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.roll_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                {...register("email")}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.email ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="e.g. student@college.edu"
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch / Major</label>
              <input
                type="text"
                {...register("branch")}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.branch ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="e.g. Computer Science"
              />
              {errors.branch && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.branch.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year of Study</label>
                <input
                  type="number"
                  {...register("year_of_study")}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.year_of_study ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="e.g. 1"
                />
                {errors.year_of_study && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.year_of_study.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  {...register("gender")}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.gender ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <Link
              to="/students"
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-500 disabled:opacity-70 transition-colors shadow-sm"
            >
              <Save size={16} />
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;
