"use client"

import { useState } from "react"
import { format, isToday, parseISO, startOfDay } from "date-fns"
import { CheckCircle, Circle, Edit, Trash2 } from "lucide-react"
import type { Habit } from "@/components/habit-tracker"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type HabitListProps = {
  habits: Habit[]
  onToggleCompletion: (habitId: string, date: string) => void
  onDelete: (habitId: string) => void
  onEdit: (habitId: string) => void
}

export function HabitList({ habits, onToggleCompletion, onDelete, onEdit }: HabitListProps) {
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const today = startOfDay(new Date()).toISOString()

  const isHabitCompletedToday = (habit: Habit) => {
    // Check if already completed today
    const isCompleted = habit.completedDates.some((date) => {
      const parsedDate = parseISO(date)
      return isToday(parsedDate)
    })

    if (isCompleted) return true

    // For custom frequency, check if today is NOT a selected day
    // If today is not a selected day, we should NOT show it as incomplete
    if (habit.frequency === "custom" && habit.daysOfWeek && habit.daysOfWeek.length > 0) {
      const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
      return !habit.daysOfWeek.includes(today) // Return true if today is NOT a selected day
    }

    return false
  }

  const getStreakCount = (habit: Habit) => {
    if (habit.completedDates.length === 0) return 0

    // Sort dates in descending order
    const sortedDates = [...habit.completedDates]
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // For daily habits
    if (habit.frequency === "daily") {
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i])
        date.setHours(0, 0, 0, 0)

        // If this is the first iteration or the date is one day before the current date
        if (i === 0 || (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 1) {
          streak++
          currentDate = date
        } else {
          break
        }
      }
    } else {
      // For weekly habits (simplified)
      streak = sortedDates.length
    }

    return streak
  }

  const getWeeklyCompletionCount = (habit: Habit) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    return habit.completedDates.filter((date) => {
      const completionDate = parseISO(date)
      return completionDate >= startOfWeek
    }).length
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const isCompleted = isHabitCompletedToday(habit)
        const streak = getStreakCount(habit)

        return (
          <div
            key={habit.id}
            onClick={() => onToggleCompletion(habit.id, today)}
            className={`rounded-lg border p-4 transition-colors cursor-pointer ${
              isCompleted ? "border-green-200 bg-green-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-0.5 rounded-full p-1 transition-colors ${
                    isCompleted ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="h-6 w-6 fill-green-100" /> : <Circle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-medium">{habit.name}</h3>
                  {habit.description && <p className="mt-1 text-sm text-gray-600">{habit.description}</p>}
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-gray-500">
                      {habit.frequency === "daily" && "Daily"}
                      {habit.frequency === "weekly" && "Weekly"}
                      {habit.frequency === "custom" && "Custom Days"}
                      {habit.frequency === "multiple-daily" && `${habit.timesPerDay}x Daily`}
                      {habit.frequency === "n-times-weekly" && `${habit.timesPerWeek}x Weekly`}
                    </span>

                    {habit.frequency === "multiple-daily" && (
                      <span className="text-gray-600">
                        {(habit.completionsCount && habit.completionsCount[today]) || 0}/{habit.timesPerDay} today
                      </span>
                    )}

                    {habit.frequency === "n-times-weekly" && (
                      <span className="text-gray-600">
                        {getWeeklyCompletionCount(habit)}/{habit.timesPerWeek} this week
                      </span>
                    )}

                    {streak > 0 && (
                      <span className="font-medium text-orange-600">
                        {streak} day{streak !== 1 && "s"} streak
                      </span>
                    )}
                    <span className="text-gray-500">Started {format(parseISO(habit.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(habit.id)
                  }}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setHabitToDelete(habit.id)
                  }}
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and all of its tracking data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (habitToDelete) {
                  onDelete(habitToDelete)
                  setHabitToDelete(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
