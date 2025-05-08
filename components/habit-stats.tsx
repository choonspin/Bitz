"use client"

import { useMemo } from "react"
import { parseISO, differenceInDays, startOfDay } from "date-fns"
import type { Habit } from "@/components/habit-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type HabitStatsProps = {
  habits: Habit[]
}

export function HabitStats({ habits }: HabitStatsProps) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date())

    // Total habits
    const totalHabits = habits.length

    // Habits completed today
    const habitsCompletedToday = habits.filter((habit) =>
      habit.completedDates.some((date) => {
        const parsedDate = parseISO(date)
        return differenceInDays(today, parsedDate) === 0
      }),
    ).length

    // Completion rate today
    const completionRateToday = totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0

    // Longest streak
    let longestStreak = 0
    let longestStreakHabit = ""

    habits.forEach((habit) => {
      if (habit.completedDates.length === 0) return

      // Sort dates in ascending order
      const sortedDates = [...habit.completedDates]
        .map((date) => parseISO(date))
        .sort((a, b) => a.getTime() - b.getTime())

      let currentStreak = 1
      let maxStreak = 1

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1]
        const currDate = sortedDates[i]

        if (differenceInDays(currDate, prevDate) === 1) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
      }

      if (maxStreak > longestStreak) {
        longestStreak = maxStreak
        longestStreakHabit = habit.name
      }
    })

    // Most consistent habit
    const habitConsistency = habits.map((habit) => {
      const daysSinceCreation = differenceInDays(today, parseISO(habit.createdAt)) + 1 // Include today

      const expectedCompletions = habit.frequency === "daily" ? daysSinceCreation : Math.floor(daysSinceCreation / 7)

      const actualCompletions = habit.completedDates.length
      const consistency = expectedCompletions > 0 ? (actualCompletions / expectedCompletions) * 100 : 0

      return {
        name: habit.name,
        consistency: Math.min(consistency, 100), // Cap at 100%
      }
    })

    const mostConsistentHabit =
      habitConsistency.length > 0
        ? habitConsistency.reduce((prev, current) => (prev.consistency > current.consistency ? prev : current))
        : { name: "", consistency: 0 }

    return {
      totalHabits,
      habitsCompletedToday,
      completionRateToday,
      longestStreak,
      longestStreakHabit,
      mostConsistentHabit,
    }
  }, [habits])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Progress</CardTitle>
          <CardDescription>
            {stats.habitsCompletedToday} of {stats.totalHabits} habits completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={stats.completionRateToday} className="h-2" />
            <p className="text-sm text-gray-500">{stats.completionRateToday}% complete</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Longest Streak</CardTitle>
          <CardDescription>Your most consistent performance</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.longestStreak > 0 ? (
            <div>
              <p className="text-2xl font-bold">{stats.longestStreak} days</p>
              <p className="text-sm text-gray-500">Habit: {stats.longestStreakHabit}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No streaks yet. Start building one today!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Most Consistent Habit</CardTitle>
          <CardDescription>Your best performing habit</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.mostConsistentHabit.consistency > 0 ? (
            <div>
              <p className="text-lg font-medium">{stats.mostConsistentHabit.name}</p>
              <div className="mt-2 space-y-2">
                <Progress value={Math.round(stats.mostConsistentHabit.consistency)} className="h-2" />
                <p className="text-sm text-gray-500">
                  {Math.round(stats.mostConsistentHabit.consistency)}% consistency
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Keep tracking to see your most consistent habit</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Habit Overview</CardTitle>
          <CardDescription>Summary of your tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Habits</span>
              <span className="font-medium">{stats.totalHabits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Daily Habits</span>
              <span className="font-medium">{habits.filter((h) => h.frequency === "daily").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Weekly Habits</span>
              <span className="font-medium">{habits.filter((h) => h.frequency === "weekly").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Completions</span>
              <span className="font-medium">{habits.reduce((sum, habit) => sum + habit.completedDates.length, 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
