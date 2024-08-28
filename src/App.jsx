import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormInput from "./components/forms/FormInput";
import FormTextArea from "./components/forms/FormTextArea";
import FormSelect from "./components/forms/FormSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const formSchema = z.object({
  jobRole: z.string().min(1, { message: "Required" }),
  fullName: z.string().min(3).max(25),
  email: z.string().email(),
  address: z.string().min(10).max(120),
  qualification: z.string().min(2).max(120),
  comments: z.string().min(15).max(2000),
});

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [candidates, setCandidates] = useState([]);

  const COLLECTION_NAME = "candidates";

  const sendTisToServer = async (data) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
      console.log("Document written with ID: ", docRef.id);
      alert("Added as you said!");
      reset();
      setCandidates([...candidates, { id: docRef.id, ...data }]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      setCandidates(candidates.filter((candidate) => candidate.id !== id));
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  useEffect(() => {
    async function getDataFromFireBase() {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

      setCandidates(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      if (querySnapshot.docs.length === 0) {
        console.log("No Record Found");
      }
    }
    getDataFromFireBase();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-500 p-5 rounded-lg text-center text-white font-semibold">
        Interview Schedule Candidates
      </header>

      <main>
        <div className="bg-white m-10 p-5 rounded-2xl">
          <h2 className="font-semibold text-lg">
            Interview Scheduled Candidates
          </h2>

          <form className="space-y-7" onClick={handleSubmit(sendTisToServer)}>
            <FormSelect name="jobRole" register={register("jobRole")} />

            <FormInput
              name="fullName"
              type="text"
              placeholder="Full Name"
              register={register("fullName")}
              error={errors.fullName}
            />
            <FormInput
              name="email"
              type="e-mail"
              placeholder="Email"
              register={register("email")}
              error={errors.email}
            />

            <FormTextArea
              name="address"
              type="text"
              placeholder="Address"
              register={register("address")}
              error={errors.address}
            />
            <FormTextArea
              name="qualification"
              type="text"
              placeholder="Qualification"
              register={register("qualification")}
              error={errors.qualification}
            />
            <FormTextArea
              name="comments"
              type="text"
              placeholder="Comments"
              register={register("comments")}
              error={errors.comments}
            />
            <div className="text-center ">
              <button className="bg-orange-600 p-3 rounded-lg text-white font-semibold justify-center w-20 mx-auto">
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
      <div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 w-20">
                  S.No
                </th>
                <th scope="col" className="px-6 py-3">
                  Full Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Job Role
                </th>

                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Qualification
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{candidate.fullName}</td>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {candidate.jobRole}
                  </th>

                  <td className="px-6 py-4">{candidate.email}</td>
                  <td className="px-6 py-4">{candidate.qualification}</td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-red-500 text-white font-semibold px-3 py-1 rounded"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
