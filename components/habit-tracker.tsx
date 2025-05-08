"use client"

import { useState, useEffect } from "react" // Keep useEffect for localStorage
import { PlusCircle, CheckCircle2, BarChart3, Calendar } from "lucide-react"
import { HabitForm, HabitFormValues } from "@/components/habit-form" // Assuming HabitFormValues is exported
import { HabitList } from "@/components/habit-list"
import { HabitCalendar } from "@/components/habit-calendar"
import { HabitStats } from "@/components/habit-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type Habit = {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "custom" | "n-times-weekly" | "multiple-daily"
  daysOfWeek?: number[]
  timesPerDay?: number
  timesPerWeek?: number
  completedDates: string[]
  completionsCount?: Record<string, number>
  createdAt: string
}

type HabitTrackerProps = {
  isFormOpen: boolean
  onFormOpen: () => void
  onFormCancel: () => void
  selectedHabit: Habit | null
  onSetSelectedHabit: (habit: Habit | null) => void
}

export function HabitTracker({ 
  isFormOpen, 
  onFormOpen, 
  onFormCancel, 
  selectedHabit, 
  onSetSelectedHabit 
}: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([])

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }, [])

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = (habitValues: HabitFormValues) => { // Changed type to HabitFormValues
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitValues.name,
      description: habitValues.description,
      frequency: habitValues.frequency,
      daysOfWeek: habitValues.daysOfWeek || [],
      timesPerDay: habitValues.timesPerDay || 1,
      timesPerWeek: habitValues.timesPerWeek || 1,
      completedDates: [],
      completionsCount: {},
      createdAt: new Date().toISOString(),
    }
    setHabits([...habits, newHabit])
    onFormCancel() // Call prop to close form
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDates.includes(date)

          if (habit.frequency === "multiple-daily") {
            const completionsCount = { ...(habit.completionsCount || {}) }
            if (!completionsCount[date]) {
              completionsCount[date] = 1
              return { ...habit, completedDates: [...habit.completedDates, date], completionsCount }
            } else if (completionsCount[date] < (habit.timesPerDay || 1)) {
              completionsCount[date] += 1
              return { ...habit, completionsCount }
            } else {
              delete completionsCount[date]
              return { ...habit, completedDates: habit.completedDates.filter((d) => d !== date), completionsCount }
            }
          } else {
            return {
              ...habit,
              completedDates: isCompleted
                ? habit.completedDates.filter((d) => d !== date)
                : [...habit.completedDates, date],
            }
          }
        }
        return habit
      }),
    )
  }

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId))
  }

  const editHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    if (habit) {
      onSetSelectedHabit(habit) // Use prop
      onFormOpen() // Use prop
    }
  }

  const updateHabit = (updatedHabitValues: HabitFormValues) => { // Changed type
    if (!selectedHabit) return

    setHabits(
      habits.map((habit) => {
        if (habit.id === selectedHabit.id) {
          // Merge only the fields present in HabitFormValues
          return { 
            ...habit, 
            name: updatedHabitValues.name,
            description: updatedHabitValues.description,
            frequency: updatedHabitValues.frequency,
            daysOfWeek: updatedHabitValues.daysOfWeek || [],
            timesPerDay: updatedHabitValues.timesPerDay || 1,
            timesPerWeek: updatedHabitValues.timesPerWeek || 1,
          }
        }
        return habit
      }),
    )
    onSetSelectedHabit(null) // Use prop
    onFormCancel() // Use prop
  }

  return (
    <div className="space-y-6">
      {/* Header removed, will be handled by parent component */}

      <div className="mt-2 mb-4 text-lg font-medium text-gray-600">
        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>

      {isFormOpen && ( // Use prop
        <HabitForm
          onSubmit={selectedHabit ? updateHabit : addHabit}
          onCancel={() => {
            onFormCancel() // Use prop
            onSetSelectedHabit(null) // Use prop
          }}
          initialValues={selectedHabit || undefined} // Use prop
        />
      )}

      {habits.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-600">No habits yet</h3>
          <p className="mt-2 text-gray-500">Add your first habit to start tracking your progress.</p>
        </div>
      ) : (
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Habits</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <HabitList
              habits={habits}
              onToggleCompletion={toggleHabitCompletion}
              onDelete={deleteHabit}
              onEdit={editHabit} // This now calls onSetSelectedHabit and onFormOpen via props
            />
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <HabitCalendar habits={habits} onToggleCompletion={toggleHabitCompletion} />
          </TabsContent>
          <TabsContent value="stats" className="mt-6">
            <HabitStats habits={habits} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
