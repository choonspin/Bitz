"use client"; // Required for useState

import { useState } from "react"; // Import useState
import { HabitTracker, type Habit } from "@/components/habit-tracker"; // Import Habit type
import { Logo } from "@/components/Logo";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const handleOpenForm = () => {
    setSelectedHabit(null); // Clear selected habit for new entry
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSelectedHabit(null); // Clear selected habit on cancel
  };

  // This function will be passed to HabitTracker for it to open the form for editing
  const handleEditHabitOpenForm = () => {
    setIsFormOpen(true);
    // selectedHabit will be set by onSetSelectedHabit called from within HabitTracker
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between">
          <Logo />
          <button 
            onClick={handleOpenForm} // Use handler to open form
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-plus h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
            <span>Add Habit</span>
          </button>
        </div>
        <HabitTracker 
          isFormOpen={isFormOpen}
          onFormOpen={handleEditHabitOpenForm} // Pass the specific handler for edits
          onFormCancel={handleCancelForm}
          selectedHabit={selectedHabit}
          onSetSelectedHabit={setSelectedHabit}
        />
      </div>
    </div>
  );
}
