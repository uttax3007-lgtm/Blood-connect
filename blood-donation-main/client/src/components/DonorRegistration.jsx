import { useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiDroplet,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiHeart,
  FiPlus,
  FiTrash2,
  FiShield,
} from "react-icons/fi";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/donors`;

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const initialForm = {
  name: "",
  phone: "",
  city: "",
  bloodGroup: "A+",
  notes: "",
  allowCall: false,
  lastDonatedAt: "",
  availabilityType: "always",
  dateOfBirth: "",
  gender: "",
  availabilitySlots: [],
};

const initialSlot = {
  day: "Mon",
  startTime: "09:00",
  endTime: "17:00",
};

function DonorRegistration() {
  const [form, setForm] = useState(initialForm);
  const [slot, setSlot] = useState(initialSlot);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const dob = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  };

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const addAvailabilitySlot = () => {
    if (!slot.startTime || !slot.endTime) {
      showMessage("Please select both start and end times.");
      return;
    }

    if (slot.startTime >= slot.endTime) {
      showMessage("End time must be later than start time.");
      return;
    }

    const duplicate = form.availabilitySlots.some(
      (existing) =>
        existing.day === slot.day &&
        existing.startTime === slot.startTime &&
        existing.endTime === slot.endTime
    );

    if (duplicate) {
      showMessage("This availability slot has already been added.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      availabilitySlots: [
        ...previous.availabilitySlots,
        { ...slot },
      ],
    }));

    setMessage("");
  };

  const removeAvailabilitySlot = (index) => {
    setForm((previous) => ({
      ...previous,
      availabilitySlots: previous.availabilitySlots.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setMessage("");

    const {
      name,
      phone,
      city,
      bloodGroup,
      dateOfBirth,
      gender,
      availabilityType,
      availabilitySlots,
    } = form;

    if (
      !name.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !dateOfBirth ||
      !gender
    ) {
      showMessage("Please complete all required fields.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      showMessage("Please enter a valid phone number.");
      return;
    }

    const dob = new Date(`${dateOfBirth}T00:00:00`);
    const age = calculateAge(dateOfBirth);

    if (
      Number.isNaN(dob.getTime()) ||
      dob > new Date() ||
      age === null ||
      age < 18 ||
      age > 120
    ) {
      showMessage("Please enter a valid date of birth. Registration requires an age of at least 18.");
      return;
    }

    if (
      form.lastDonatedAt &&
      new Date(`${form.lastDonatedAt}T00:00:00`) > new Date()
    ) {
      showMessage("Last donation date cannot be in the future.");
      return;
    }

    if (
      availabilityType === "custom" &&
      availabilitySlots.length === 0
    ) {
      showMessage("Please add at least one availability slot.");
      return;
    }

    const payload = {
      ...form,
      name: name.trim(),
      phone: phoneDigits,
      city: city.trim(),
      notes: form.notes.trim(),
      availability:
        availabilityType === "always"
          ? "Available"
          : "Scheduled",
      availabilitySlots:
        availabilityType === "always"
          ? []
          : availabilitySlots,
    };

    try {
      setSubmitting(true);

      await axios.post(API_URL, payload);

      showMessage(
        "Registration successful! Thank you for becoming a BloodConnect donor.",
        "success"
      );

      setForm(initialForm);
      setSlot(initialSlot);
    } catch (err) {
      console.error("Donor registration failed:", err);

      showMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to complete registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#C1122F] focus:ring-2 focus:ring-rose-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-neutral-700";

  return (
    <main className="min-h-screen bg-[#FAFAF9] pt-24 pb-16">

      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        {/* HEADER */}

        <div className="mb-9 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[#C1122F]">
            <FiHeart className="text-2xl" />
          </div>

          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#C1122F]">
            Join the BloodConnect Community
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Become a Blood Donor
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Your willingness to donate can make a meaningful
            difference. Register and help connect people who
            need blood with potential donors.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleRegister}
          className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
        >

          {/* FORM HEADER */}

          <div className="border-b border-neutral-100 bg-rose-50/60 px-6 py-5 sm:px-9">

            <h2 className="text-lg font-bold text-neutral-900">
              Donor Registration Details
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Fields marked with * are required.
            </p>

          </div>

          <div className="space-y-9 p-6 sm:p-9">

            {/* NOTIFICATION */}

            {message && (
              <div
                role="alert"
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {messageType === "success" ? (
                  <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />
                ) : (
                  <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />
                )}

                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {/* PERSONAL INFORMATION */}

            <section>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#C1122F]">
                  <FiUser />
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900">
                    Personal Information
                  </h3>

                  <p className="text-xs text-neutral-500">
                    Basic information about you
                  </p>
                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* NAME */}

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) =>
                      updateForm("name", e.target.value)
                    }
                    className={inputClass}
                  />

                </div>

                {/* DATE OF BIRTH */}

                <div>

                  <label className={labelClass}>
                    Date of Birth *
                  </label>

                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      updateForm("dateOfBirth", e.target.value)
                    }
                    className={inputClass}
                  />

                  {form.dateOfBirth && (
                    <p className="mt-2 text-xs text-neutral-500">
                      Calculated age:{" "}
                      <strong>
                        {calculateAge(form.dateOfBirth)} years
                      </strong>
                    </p>
                  )}

                </div>

                {/* GENDER */}

                <div>

                  <label className={labelClass}>
                    Gender *
                  </label>

                  <select
                    required
                    value={form.gender}
                    onChange={(e) =>
                      updateForm("gender", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>

                </div>

              </div>

            </section>

            {/* CONTACT INFORMATION */}

            <section>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#C1122F]">
                  <FiPhone />
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900">
                    Contact & Location
                  </h3>

                  <p className="text-xs text-neutral-500">
                    Help recipients find potential donors
                  </p>
                </div>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className={labelClass}>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    required
                    maxLength={20}
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) =>
                      updateForm("phone", e.target.value)
                    }
                    className={inputClass}
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    City *
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Enter your city"
                    value={form.city}
                    onChange={(e) =>
                      updateForm("city", e.target.value)
                    }
                    className={inputClass}
                  />

                </div>

              </div>

              <div className="mt-5">

                <label className={labelClass}>
                  <span className="flex items-center gap-2">
                    <FiDroplet className="text-[#C1122F]" />
                    Blood Group *
                  </span>
                </label>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">

                  {bloodGroups.map((group) => (

                    <button
                      key={group}
                      type="button"
                      onClick={() =>
                        updateForm("bloodGroup", group)
                      }
                      className={`rounded-xl border py-3 text-sm font-bold transition ${
                        form.bloodGroup === group
                          ? "border-[#C1122F] bg-[#C1122F] text-white shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-rose-300 hover:bg-rose-50"
                      }`}
                    >
                      {group}
                    </button>

                  ))}

                </div>

              </div>

            </section>

            {/* DONATION HISTORY */}

            <section>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#C1122F]">
                  <FiCalendar />
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900">
                    Donation History
                  </h3>

                  <p className="text-xs text-neutral-500">
                    Optional information
                  </p>
                </div>

              </div>

              <label className={labelClass}>
                Last Blood Donation Date
              </label>

              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.lastDonatedAt}
                onChange={(e) =>
                  updateForm("lastDonatedAt", e.target.value)
                }
                className={inputClass}
              />

              <p className="mt-2 text-xs text-neutral-500">
                Leave blank if you have never donated or don't
                remember the date.
              </p>

            </section>

            {/* AVAILABILITY */}

            <section>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#C1122F]">
                  <FiClock />
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900">
                    Donor Availability
                  </h3>

                  <p className="text-xs text-neutral-500">
                    Let recipients know when you may be available
                  </p>
                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    updateForm("availabilityType", "always")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    form.availabilityType === "always"
                      ? "border-[#C1122F] bg-rose-50"
                      : "border-neutral-200 hover:border-rose-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <span className={`h-4 w-4 rounded-full border-4 ${
                      form.availabilityType === "always"
                        ? "border-[#C1122F]"
                        : "border-neutral-300"
                    }`} />

                    <span className="font-semibold text-neutral-900">
                      Generally Available
                    </span>

                  </div>

                  <p className="ml-6 mt-2 text-xs text-neutral-500">
                    I can be contacted whenever possible.
                  </p>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateForm("availabilityType", "custom")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    form.availabilityType === "custom"
                      ? "border-[#C1122F] bg-rose-50"
                      : "border-neutral-200 hover:border-rose-200"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    <span className={`h-4 w-4 rounded-full border-4 ${
                      form.availabilityType === "custom"
                        ? "border-[#C1122F]"
                        : "border-neutral-300"
                    }`} />

                    <span className="font-semibold text-neutral-900">
                      Custom Schedule
                    </span>

                  </div>

                  <p className="ml-6 mt-2 text-xs text-neutral-500">
                    Specify your preferred days and times.
                  </p>

                </button>

              </div>

              {/* CUSTOM SCHEDULE */}

              {form.availabilityType === "custom" && (

                <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">

                  <h4 className="mb-4 font-bold text-neutral-800">
                    Add Availability Slot
                  </h4>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <div>

                      <label className={labelClass}>
                        Day
                      </label>

                      <select
                        value={slot.day}
                        onChange={(e) =>
                          setSlot({
                            ...slot,
                            day: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>

                    </div>

                    <div>

                      <label className={labelClass}>
                        Start Time
                      </label>

                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          setSlot({
                            ...slot,
                            startTime: e.target.value,
                          })
                        }
                        className={inputClass}
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        End Time
                      </label>

                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          setSlot({
                            ...slot,
                            endTime: e.target.value,
                          })
                        }
                        className={inputClass}
                      />

                    </div>

                    <div className="flex items-end">

                      <button
                        type="button"
                        onClick={addAvailabilitySlot}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C1122F] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#970D26]"
                      >
                        <FiPlus />
                        Add Slot
                      </button>

                    </div>

                  </div>

                  {/* ADDED SLOTS */}

                  {form.availabilitySlots.length > 0 && (

                    <div className="mt-5 space-y-2">

                      <p className="text-sm font-semibold text-neutral-700">
                        Your Schedule
                      </p>

                      {form.availabilitySlots.map((s, index) => (

                        <div
                          key={`${s.day}-${s.startTime}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
                        >

                          <div className="flex items-center gap-3">

                            <FiCalendar className="text-[#C1122F]" />

                            <span className="text-sm font-medium text-neutral-700">
                              {s.day}: {s.startTime} – {s.endTime}
                            </span>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeAvailabilitySlot(index)
                            }
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            aria-label="Remove availability slot"
                          >
                            <FiTrash2 />
                          </button>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              )}

            </section>

            {/* ADDITIONAL INFORMATION */}

            <section>

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#C1122F]">
                  <FiHeart />
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900">
                    Additional Information
                  </h3>

                  <p className="text-xs text-neutral-500">
                    Optional preferences
                  </p>
                </div>

              </div>

              <label className={labelClass}>
                Notes
              </label>

              <textarea
                rows={4}
                maxLength={500}
                placeholder="Additional information or preferred contact timings..."
                value={form.notes}
                onChange={(e) =>
                  updateForm("notes", e.target.value)
                }
                className={`${inputClass} resize-none`}
              />

              <p className="mt-1 text-right text-xs text-neutral-400">
                {form.notes.length}/500
              </p>

            </section>

            {/* CONTACT PERMISSION */}

            <section className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">

              <label className="flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  checked={form.allowCall}
                  onChange={(e) =>
                    updateForm("allowCall", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#C1122F]"
                />

                <div>

                  <span className="font-semibold text-neutral-800">
                    Allow recipients to contact me
                  </span>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    I consent to being contacted regarding blood
                    donation requests using my registered phone
                    number. My contact information should only
                    be shared according to this permission.
                  </p>

                </div>

              </label>

            </section>

            {/* PRIVACY NOTE */}

            <div className="flex items-start gap-3 text-xs leading-5 text-neutral-500">

              <FiShield className="mt-0.5 shrink-0 text-green-700" />

              <p>
                Your information will be stored in the BloodConnect
                database. Please provide accurate information.
                Donor eligibility must always be assessed by
                qualified medical personnel.
              </p>

            </div>

            {/* SUBMIT */}

            <div className="border-t border-neutral-100 pt-6">

              <button
                type="submit"
                disabled={submitting}
                className={`flex w-full items-center justify-center gap-3 rounded-xl bg-[#C1122F] px-6 py-4 font-bold text-white shadow-sm transition ${
                  submitting
                    ? "cursor-not-allowed opacity-60"
                    : "hover:-translate-y-0.5 hover:bg-[#970D26] hover:shadow-lg"
                }`}
              >

                {submitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registering...
                  </>
                ) : (
                  <>
                    <FiHeart />
                    Complete Donor Registration
                  </>
                )}

              </button>

              <p className="mt-4 text-center text-xs text-neutral-400">
                BloodConnect · Developed by Sir Utkarsh J.
              </p>

            </div>

          </div>

        </form>

      </div>

    </main>
  );
}

export default DonorRegistration;