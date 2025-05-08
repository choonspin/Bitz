"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  subMonths,
  addMonths,
  parseISO,
  isEqual,
} from "date-fns"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Habit } from "@/components/habit-tracker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type HabitCalendarProps = {
  habits: Habit[]
  onToggleCompletion: (habitId: string, date: string) => void
}

export function HabitCalendar({ habits, onToggleCompletion }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(habits.length > 0 ? habits[0].id : null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) || null

  const isDateCompleted = (date: Date) => {
    if (!selectedHabit) return false
    return selectedHabit.completedDates.some((completedDate) => {
      return isSameDay(parseISO(completedDate), date)
    })
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    // Toggle the selected date
    if (selectedDate && isEqual(selectedDate, date)) {
      setSelectedDate(null)
    } else {
      setSelectedDate(date)
    }
  }

  const getWeeklyCompletionCount = (habit: Habit, date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    return habit.completedDates.filter((completionDate) => {
      const parsedDate = parseISO(completionDate)
      return parsedDate >= startOfWeek && parsedDate <= date
    }).length
  }

  const getHabitsForDate = (date: Date) => {
    return habits.filter((habit) => {
      // For n-times-weekly, show on all days if not yet completed enough times this week
      if (habit.frequency === "n-times-weekly") {
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0)

        const weeklyCompletions = habit.completedDates.filter((completionDate) => {
          const parsedDate = parseISO(completionDate)
          return parsedDate >= startOfWeek && parsedDate <= date
        }).length

        return weeklyCompletions < (habit.timesPerWeek || 1)
      }

      // Check if the habit should be shown on this date based on frequency
      if (habit.frequency === "daily" || habit.frequency === "multiple-daily") {
        return true
      } else if (habit.frequency === "weekly") {
        // For weekly habits, show them on all days
        return true
      } else if (habit.frequency === "custom" && habit.daysOfWeek) {
        // For custom frequency, check if the day of week matches
        return habit.daysOfWeek.includes(date.getDay())
      }

      return false
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select value={selectedHabitId || ""} onValueChange={(value) => setSelectedHabitId(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a habit" />
          </SelectTrigger>
          <SelectContent>
            {habits.map((habit) => (
              <SelectItem key={habit.id} value={habit.id}>
                {habit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 font-medium">
            {day}
          </div>
        ))}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-12 rounded-md p-1" />
        ))}
        {monthDays.map((day) => {
          const isCompleted = isDateCompleted(day)
          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              disabled={!selectedHabitId}
              className={`h-12 rounded-md p-1 transition-colors ${
                isCompleted ? "bg-green-100 hover:bg-green-200" : "hover:bg-gray-100"
              }`}
            >
              <div
                className={`flex h-full items-center justify-center rounded-md ${
                  isCompleted ? "font-medium text-green-700" : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </button>
          )
        })}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-12 rounded-md p-1" />
        ))}
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {getHabitsForDate(selectedDate).length > 0 ? (
              getHabitsForDate(selectedDate).map((habit) => {
                const isCompleted = habit.completedDates.some((date) => isSameDay(parseISO(date), selectedDate))

                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between rounded-md p-2 ${
                      isCompleted ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <span>{habit.name}</span>
                      {habit.frequency === "multiple-daily" && (
                        <div className="text-xs text-gray-500 mt-1">
                          {(habit.completionsCount && habit.completionsCount[selectedDate.toISOString()]) || 0}/
                          {habit.timesPerDay} completions
                        </div>
                      )}
                      {habit.frequency === "n-times-weekly" && (
                        <div className="text-xs text-gray-500 mt-1">
                          {getWeeklyCompletionCount(habit, selectedDate)}/{habit.timesPerWeek} this week
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleCompletion(habit.id, selectedDate.toISOString())}
                      className={isCompleted ? "text-green-600" : "text-gray-500"}
                    >
                      {isCompleted ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-500">No habits for this day</p>
            )}
          </div>
        </div>
      )}

      {!selectedHabitId && (
        <div className="mt-4 text-center text-gray-500">
          Select a habit to view and track its completion on the calendar.
        </div>
      )}
    </div>
  )
}
