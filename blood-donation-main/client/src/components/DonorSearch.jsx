import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMapPin,
  FiDroplet,
  FiPhone,
  FiUser,
  FiFilter,
  FiRefreshCw,
  FiUsers,
  FiCalendar,
  FiChevronRight,
  FiHeart,
} from "react-icons/fi";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/donors`;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();

  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() &&
      today.getDate() < dob.getDate());

  if (beforeBirthday) age--;

  return age >= 0 ? age : null;
};

export default function DonorSearch() {
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    city: "",
    bloodGroup: "",
    gender: "",
    minAge: "",
    maxAge: "",
    availability: "",
    sort: "newest",
  });

  const [page, setPage] = useState(1);
  const pageSize = 9;

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      setDonors(
        Array.isArray(response.data)
          ? response.data
          : response.data.donors || []
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to load donors. Please check your server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const cities = useMemo(
    () =>
      [...new Set(donors.map((d) => d.city).filter(Boolean))].sort(),
    [donors]
  );

  const filteredDonors = useMemo(() => {
    let result = donors.filter((donor) => {
      const age = getAge(donor.dateOfBirth);

      const matchesSearch =
        !filters.search ||
        donor.name?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCity =
        !filters.city || donor.city === filters.city;

      const matchesBlood =
        !filters.bloodGroup ||
        donor.bloodGroup === filters.bloodGroup;

      const matchesGender =
        !filters.gender || donor.gender === filters.gender;

      const matchesMinAge =
        !filters.minAge ||
        (age !== null && age >= Number(filters.minAge));

      const matchesMaxAge =
        !filters.maxAge ||
        (age !== null && age <= Number(filters.maxAge));

      const matchesAvailability =
        !filters.availability ||
        donor.availability === filters.availability;

      return (
        matchesSearch &&
        matchesCity &&
        matchesBlood &&
        matchesGender &&
        matchesMinAge &&
        matchesMaxAge &&
        matchesAvailability
      );
    });

    if (filters.sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "age") {
      result.sort(
        (a, b) =>
          (getAge(b.dateOfBirth) ?? -1) -
          (getAge(a.dateOfBirth) ?? -1)
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [donors, filters]);

  const bloodCounts = useMemo(
    () =>
      BLOOD_GROUPS.map((group) => ({
        group,
        count: donors.filter((d) => d.bloodGroup === group).length,
      })),
    [donors]
  );

  const totalPages = Math.ceil(filteredDonors.length / pageSize);

  const visibleDonors = filteredDonors.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      city: "",
      bloodGroup: "",
      gender: "",
      minAge: "",
      maxAge: "",
      availability: "",
      sort: "newest",
    });
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF9] pt-28 pb-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-9">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#C1122F] mb-3">
            <FiHeart />
            BLOODCONNECT COMMUNITY
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Find Blood Donors
          </h1>

          <p className="text-neutral-500 mt-3 max-w-2xl">
            Discover registered blood donors in your city.
            Filter by blood group, age, gender and availability
            to find potential donors.
          </p>
        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <FiUsers className="text-[#C1122F] text-xl mb-3" />
            <p className="text-2xl font-bold">{donors.length}</p>
            <p className="text-sm text-neutral-500">Registered donors</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <FiMapPin className="text-[#C1122F] text-xl mb-3" />
            <p className="text-2xl font-bold">{cities.length}</p>
            <p className="text-sm text-neutral-500">Cities covered</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <FiDroplet className="text-[#C1122F] text-xl mb-3" />
            <p className="text-2xl font-bold">
              {bloodCounts.filter((b) => b.count > 0).length}
            </p>
            <p className="text-sm text-neutral-500">Blood groups represented</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <FiHeart className="text-green-600 text-xl mb-3" />
            <p className="text-2xl font-bold">
              {donors.filter((d) => d.availability === "Available").length}
            </p>
            <p className="text-sm text-neutral-500">Marked available</p>
          </div>

        </div>

        {/* SEARCH */}

        <section className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 mb-6">

          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FiFilter className="text-[#C1122F]" />
              Find your donor
            </h2>

            <button
              onClick={resetFilters}
              className="text-sm text-[#C1122F] font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>

          <div className="relative mb-5">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />

            <input
              type="text"
              placeholder="Search donors by name..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 outline-none focus:border-[#C1122F] focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <select
              value={filters.bloodGroup}
              onChange={(e) => updateFilter("bloodGroup", e.target.value)}
              className="filter-input"
            >
              <option value="">All blood groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <select
              value={filters.city}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="filter-input"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filters.gender}
              onChange={(e) => updateFilter("gender", e.target.value)}
              className="filter-input"
            >
              <option value="">All genders</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>

            <select
              value={filters.availability}
              onChange={(e) => updateFilter("availability", e.target.value)}
              className="filter-input"
            >
              <option value="">All availability</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Scheduled">Scheduled</option>
            </select>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">

            <input
              type="number"
              min="18"
              max="100"
              placeholder="Minimum age"
              value={filters.minAge}
              onChange={(e) => updateFilter("minAge", e.target.value)}
              className="filter-input"
            />

            <input
              type="number"
              min="18"
              max="100"
              placeholder="Maximum age"
              value={filters.maxAge}
              onChange={(e) => updateFilter("maxAge", e.target.value)}
              className="filter-input"
            />

            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="filter-input col-span-2"
            >
              <option value="newest">Recently registered</option>
              <option value="name">Name: A to Z</option>
              <option value="age">Age: Highest first</option>
            </select>

          </div>

        </section>

        {/* BLOOD GROUP QUICK FILTER */}

        <div className="flex gap-2 overflow-x-auto pb-4 mb-5">
          <button
            onClick={() => updateFilter("bloodGroup", "")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border ${
              !filters.bloodGroup
                ? "bg-[#C1122F] text-white border-[#C1122F]"
                : "bg-white text-neutral-600 border-neutral-200"
            }`}
          >
            All groups
          </button>

          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => updateFilter("bloodGroup", group)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border ${
                filters.bloodGroup === group
                  ? "bg-[#C1122F] text-white border-[#C1122F]"
                  : "bg-white text-neutral-600 border-neutral-200"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* RESULTS HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Available donor records
            </h2>

            <p className="text-sm text-neutral-500 mt-1">
              Showing {filteredDonors.length} matching donors
            </p>
          </div>

          <button
            onClick={fetchDonors}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold hover:bg-neutral-50"
          >
            <FiRefreshCw />
            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-5">
            {error}
            <button onClick={fetchDonors} className="underline ml-2">
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-56 bg-white rounded-2xl border border-neutral-200 animate-pulse"
              />
            ))}
          </div>
        ) : visibleDonors.length > 0 ? (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {visibleDonors.map((donor) => (

              <article
                key={donor._id}
                className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-rose-200 hover:shadow-lg transition-all duration-200"
              >

                <div className="flex items-start justify-between mb-5">

                  <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-[#C1122F] text-xl">
                      <FiUser />
                    </div>

                    <div>
                      <h3 className="font-bold text-neutral-900">
                        {donor.name}
                      </h3>

                      <p className="text-sm text-neutral-500">
                        {donor.city}
                      </p>
                    </div>

                  </div>

                  <span className="bg-rose-50 text-[#C1122F] font-bold px-3 py-2 rounded-xl">
                    {donor.bloodGroup}
                  </span>

                </div>

                <div className="space-y-3 text-sm text-neutral-600 mb-5">

                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <FiCalendar /> Age
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {getAge(donor.dateOfBirth) ?? "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <FiUser /> Gender
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {donor.gender || "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <FiMapPin /> Location
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {donor.city}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Availability</span>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      donor.availability === "Available"
                        ? "bg-green-50 text-green-700"
                        : donor.availability === "Scheduled"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {donor.availability || "Unknown"}
                    </span>
                  </div>

                </div>

                <div className="flex gap-2 pt-4 border-t border-neutral-100">

                  <button
                    onClick={() => navigate(`/donor/${donor._id}`)}
                    className="flex-1 flex justify-center items-center gap-2 bg-[#C1122F] hover:bg-[#970D26] text-white py-3 rounded-xl text-sm font-semibold transition"
                  >
                    View profile
                    <FiChevronRight />
                  </button>

                  {donor.allowCall && donor.phone && (
                    <a
                      href={`tel:${donor.phone}`}
                      className="flex items-center justify-center px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                      aria-label={`Call ${donor.name}`}
                    >
                      <FiPhone />
                    </a>
                  )}

                </div>

              </article>

            ))}

          </div>

        ) : !error ? (

          <div className="bg-white border border-neutral-200 rounded-2xl py-20 text-center">

            <FiUsers className="mx-auto text-4xl text-neutral-300 mb-4" />

            <h3 className="text-xl font-bold text-neutral-800">
              No donors found
            </h3>

            <p className="text-neutral-500 mt-2">
              Try changing your filters or search criteria.
            </p>

            <button
              onClick={resetFilters}
              className="mt-5 px-5 py-2.5 bg-[#C1122F] text-white rounded-xl font-semibold"
            >
              Clear filters
            </button>

          </div>

        ) : null}

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded-xl disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-semibold">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded-xl disabled:opacity-40"
            >
              Next
            </button>

          </div>
        )}

      </div>

    </main>
  );
}