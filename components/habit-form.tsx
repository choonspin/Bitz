"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import type { Habit } from "@/components/habit-tracker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

// Define and export HabitFormValues
export type HabitFormValues = {
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "custom" | "n-times-weekly" | "multiple-daily";
  daysOfWeek: number[];
  timesPerDay: number;
  timesPerWeek: number;
};

type HabitFormProps = {
  onSubmit: (values: HabitFormValues) => void; // Use HabitFormValues
  onCancel: () => void;
  initialValues?: Habit; // initialValues can still be a full Habit or just parts of it for editing
}

export function HabitForm({ onSubmit, onCancel, initialValues }: HabitFormProps) {
  const [formData, setFormData] = useState<HabitFormValues>({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    frequency: initialValues?.frequency || "daily",
    daysOfWeek: initialValues?.daysOfWeek || [],
    timesPerDay: initialValues?.timesPerDay || 1,
    timesPerWeek: initialValues?.timesPerWeek || 1,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFrequencyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      frequency: value as "daily" | "weekly" | "custom" | "n-times-weekly" | "multiple-daily",
    }))
  }

  const handleDayToggle = (day: number) => {
    setFormData((prev) => {
      const newDaysOfWeek = [...prev.daysOfWeek]
      if (newDaysOfWeek.includes(day)) {
        return { ...prev, daysOfWeek: newDaysOfWeek.filter((d) => d !== day) }
      } else {
        return { ...prev, daysOfWeek: [...newDaysOfWeek, day] }
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{initialValues ? "Edit Habit" : "Add New Habit"}</h2>
        <button onClick={onCancel} className="rounded-full p-1 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Habit Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Morning Meditation"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details about your habit..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <RadioGroup value={formData.frequency} onValueChange={handleFrequencyChange} className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple-daily" id="multiple-daily" />
              <Label htmlFor="multiple-daily">Multiple Times Daily</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="n-times-weekly" id="n-times-weekly" />
              <Label htmlFor="n-times-weekly">N Times Weekly</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.frequency === "multiple-daily" && (
          <div className="space-y-2">
            <Label htmlFor="timesPerDay">Times Per Day</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, timesPerDay: Math.max(1, (prev.timesPerDay || 1) - 1) }))
                }
                disabled={(formData.timesPerDay || 1) <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center">{formData.timesPerDay || 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData((prev) => ({ ...prev, timesPerDay: (prev.timesPerDay || 1) + 1 }))}
              >
                +
              </Button>
            </div>
          </div>
        )}

        {formData.frequency === "n-times-weekly" && (
          <div className="space-y-2">
            <Label htmlFor="timesPerWeek">Times Per Week</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, timesPerWeek: Math.max(1, (prev.timesPerWeek || 1) - 1) }))
                }
                disabled={(formData.timesPerWeek || 1) <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center">{formData.timesPerWeek || 1}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData((prev) => ({ ...prev, timesPerWeek: (prev.timesPerWeek || 1) + 1 }))}
              >
                +
              </Button>
            </div>
          </div>
        )}

        {formData.frequency === "custom" && (
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(index)}
                  className={`rounded-md px-3 py-1 text-sm ${
                    formData.daysOfWeek.includes(index) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{initialValues ? "Update" : "Add"} Habit</Button>
        </div>
      </form>
    </div>
  )
}
