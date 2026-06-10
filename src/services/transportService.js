import { getDataProvider } from "../data";

// === ROUTE MANAGEMENT ===
export const getAllRoutes = async () => {
  const provider = getDataProvider();
  const [routes, vehicles, employees, allocations] = await Promise.all([
    provider.getTransportRoutes(),
    provider.getTransportVehicles(),
    provider.getEmployees(),
    provider.getTransportAllocations(),
  ]);

  return routes.map((r) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicleId);
    const driver = employees.find((e) => e.employeeId === r.driverId);
    // Occupancy = calculated from allocations, not stored
    const routeAllocations = allocations.filter((a) => a.routeId === r.id && a.status === "ACTIVE");
    
    return {
      ...r,
      vehicleNo: vehicle?.vehicleNo || "N/A",
      capacity: vehicle?.capacity || 40,
      vehicleModel: vehicle?.model || "N/A",
      registrationNo: vehicle?.registrationNo || "N/A",
      driverName: driver?.employeeName || "Unassigned",
      driverPhone: driver?.phone || "N/A",
      occupancy: routeAllocations.length,
      boys: routeAllocations.filter(a => a.gender === "Male").length,
      girls: routeAllocations.filter(a => a.gender === "Female").length,
    };
  });
};


export const createRoute = async (routeData) => {
  return await getDataProvider().createTransportRoute(routeData);
};

export const updateRoute = async (id, updates) => {
  return await getDataProvider().updateTransportRoute(id, updates);
};

export const deleteRoute = async (id) => {
  return await getDataProvider().deleteTransportRoute(id);
};

// === VEHICLE MANAGEMENT ===
export const getAllVehicles = async () => {
  return await getDataProvider().getTransportVehicles();
};

export const createVehicle = async (vehicleData) => {
  return await getDataProvider().createTransportVehicle(vehicleData);
};

export const updateVehicle = async (id, updates) => {
  return await getDataProvider().updateTransportVehicle(id, updates);
};

export const deleteVehicle = async (id) => {
  return await getDataProvider().deleteTransportVehicle(id);
};

// === DRIVER MANAGEMENT ===
export const getAllDrivers = async () => {
  return await getDataProvider().getTransportDrivers();
};

export const createDriver = async (driverData) => {
  return await getDataProvider().createEmployee(driverData);
};

// === ALERT MANAGEMENT ===
export const getAllAlerts = async () => {
  return await getDataProvider().getTransportAlerts();
};

export const createAlert = async (alertData) => {
  return await getDataProvider().createTransportAlert(alertData);
};

export const deleteAlert = async (alertId) => {
  return await getDataProvider().deleteTransportAlert(alertId);
};

// === STOPS MANAGEMENT ===
export const getStopsByRoute = async (routeId) => {
  return await getDataProvider().getTransportStopsByRoute(routeId);
};

export const getAllStops = async () => {
  return await getDataProvider().getTransportStops();
};

export const createStop = async (stopData) => {
  return await getDataProvider().createTransportStop(stopData);
};

export const updateStop = async (stopId, updates) => {
  return await getDataProvider().updateTransportStop(stopId, updates);
};

export const deleteStop = async (stopId) => {
  return await getDataProvider().deleteTransportStop(stopId);
};

// === STUDENT ALLOCATION MANAGEMENT ===
export const getAllAllocations = async () => {
  return await getDataProvider().getTransportAllocations();
};

export const getAllocationsByRoute = async (routeId) => {
  return await getDataProvider().getTransportAllocationsByRoute(routeId);
};

export const createAllocation = async (data) => {
  return await getDataProvider().createTransportAllocation(data);
};

export const deleteAllocation = async (allocationId) => {
  return await getDataProvider().deleteTransportAllocation(allocationId);
};



export const getTransportSummary = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const assignment = await provider.getTransportAssignmentByStudent(id);
  if (!assignment) return null;

  const route = await provider.getTransportRouteById(
    assignment.assignedRouteId,
  );
  const vehicle = await provider.getTransportVehicleById(
    assignment.assignedVehicleId,
  );

  const activeDirection = route?.activeDirection || "PICKUP_ROUTE";
  const pickupStopObj = (route?.stops || []).find(
    (st) => st.stopId === assignment.pickupStopId,
  );
  const dropStopObj = (route?.stops || []).find(
    (st) => st.stopId === assignment.dropStopId,
  );

  // Derive nextStop based on activeDirection
  let nextStop = "Main Gate";
  const stopsList = route?.stops || [];
  if (activeDirection === "DROP_ROUTE") {
    // School is the origin; nextStop is the first student drop stop
    const dropStopsOnly = stopsList.filter((st) => !st.isSchool).reverse();
    nextStop = dropStopsOnly[0]?.stopName || "First Stop";
  } else {
    // Morning pickup; nextStop is the second stop in the sequence
    nextStop = stopsList[1]?.stopName || "Main Road Square";
  }

  return {
    routeNo: route?.routeNo || "RT-101",
    pickupStop:
      activeDirection === "DROP_ROUTE"
        ? dropStopObj?.stopName || "HomeStop"
        : pickupStopObj?.stopName || "HomeStop",
    pickupTime:
      activeDirection === "DROP_ROUTE"
        ? dropStopObj?.afternoonEta || "04:15 PM"
        : pickupStopObj?.eta || "07:15 AM",
    vehicleNo: vehicle?.vehicleNo || "DL-1PB-4521",
    passId: `TP-${studentId.replace("stud-", "")}-2025`,
    status: assignment.status || "Active",
    validTill: "31 March 2026",
    nextStop,
    activeDirection,
  };
};

export const getVehicleDetails = async (studentIdOrVehicleId) => {
  const provider = getDataProvider();
  const assignment = await provider.getTransportAssignmentByStudent(studentIdOrVehicleId);
  if (assignment) {
    return await provider.getTransportVehicleById(assignment.assignedVehicleId);
  }
  return await provider.getTransportVehicleById(studentIdOrVehicleId);
};

export const getPersonnelInfo = async (studentId) => {
  const provider = getDataProvider();
  const assignment = await provider.getTransportAssignmentByStudent(studentId);
  if (!assignment) return null;

  const vehicle = await provider.getTransportVehicleById(
    assignment.assignedVehicleId,
  );
  const drivers = await provider.getTransportDrivers();
  const driver = drivers.find((d) => d.id === vehicle.driverId);

  return {
    driver: {
      name: driver?.name || "Ramesh Chand",
      rating: driver?.rating || 4.8,
      experience: driver?.experience || "12 Years",
      contact: driver?.emergencyContact || "+91 98765 43210",
      shift: driver?.shift || "Morning Shift",
      verified: true,
    },
    attendant: {
      name: vehicle?.attendantName || "Mr. Satish Mehra",
    },
  };
};

export const getRouteTimeline = async (studentIdOrRouteId, studentId = null) => {
  const provider = getDataProvider();
  let route = null;
  const targetStudentId = studentId || studentIdOrRouteId || "stud-001";
  
  const assignment = await provider.getTransportAssignmentByStudent(targetStudentId);
  if (assignment) {
    route = await provider.getTransportRouteById(assignment.assignedRouteId);
  } else {
    route = await provider.getTransportRouteById(studentIdOrRouteId);
  }
  
  if (!route) return [];

  const activeDirection = route?.activeDirection || "PICKUP_ROUTE";
  const stops = route?.stops || [];
  let timeline = [];

  if (activeDirection === "DROP_ROUTE") {
    // School is the origin; drop stops follow in reverse order
    const schoolStop = stops.find((st) => st.isSchool);
    const dropStops = stops.filter((st) => !st.isSchool).reverse();

    timeline.push({
      stop: schoolStop?.stopName || "Springdale Senior Secondary",
      time: route?.dropTime || "04:00 PM",
      isPickup: false,
      isSchool: true,
      current: false,
    });

    dropStops.forEach((stop) => {
      timeline.push({
        stop: stop.stopName,
        time: stop.afternoonEta || "04:15 PM",
        isPickup: assignment ? stop.stopId === assignment.dropStopId : false,
        isSchool: false,
        current: assignment ? stop.stopId === assignment.dropStopId : false,
      });
    });
  } else {
    // Morning pickup; stops ending at school terminal node
    stops.forEach((stop) => {
      timeline.push({
        stop: stop.stopName,
        time: stop.eta,
        isPickup: assignment ? stop.stopId === assignment.pickupStopId : false,
        isSchool: stop.isSchool || false,
        current: assignment ? stop.stopId === assignment.pickupStopId : false,
      });
    });
  }

  return timeline;
};

export const getTransportNotices = async (studentId, lang = "en") => {
  const provider = getDataProvider();
  const alertsList = await provider.getTransportAlerts();

  // Determine student's route (if available) to also include route-specific alerts
  let studentRouteId = null;
  try {
    const assignment = await provider.getTransportAssignmentByStudent(studentId);
    studentRouteId = assignment?.routeId || assignment?.assignedRouteId || null;
  } catch (_) {}

  // Show: global ALL alerts + route-specific alerts for the student's route
  const relevant = alertsList.filter((al) =>
    al.routeId === "ALL" ||
    (studentRouteId && al.routeId === studentRouteId)
  );

  const typeLabel = (type, lang) => {
    const map = {
      delay:        { en: "Route Delay Alert",         hi: "मार्ग विलंब सूचना" },
      breakdown:    { en: "Vehicle Breakdown Alert",   hi: "वाहन खराबी अलर्ट" },
      diversion:    { en: "Route Diversion Warning",   hi: "मार्ग डायवर्जन सूचना" },
      reassignment: { en: "Vehicle Reassignment",      hi: "वाहन पुनर्वितरण सूचना" },
      general:      { en: "Transport Notice",          hi: "परिवहन सूचना" },
      weather:      { en: "Weather Advisory",          hi: "मौसम सलाह" },
    };
    return (map[type] || map.general)[lang] || map.general.en;
  };

  return relevant.map((al) => ({
    id: al.alertId,
    title: typeLabel(al.type, lang),
    message: lang === "hi" ? (al.messageHi || al.messageEn) : al.messageEn,
    priority: al.severity === "danger" ? "high" : "normal",
    routeId: al.routeId,
    createdAt: al.createdAt,
  }));
};

export const getSafetyGuidelines = async (studentId, lang = "en") => {
  const listEn = [
    {
      id: "sg-1",
      text: "Verify bus driver credentials and transport pass daily.",
    },
    {
      id: "sg-2",
      text: "Keep seatbelt fastened at all times while vehicle is in motion.",
    },
    { id: "sg-3", text: "Board and exit the bus only at designated stops." },
    {
      id: "sg-4",
      text: "Maintain decorum and keep emergency pathways completely clear.",
    },
  ];
  const listHi = [
    {
      id: "sg-1",
      text: "रोजाना बस चालक के क्रेडेंशियल और परिवहन पास की जांच करें।",
    },
    { id: "sg-2", text: "वाहन के चलने के दौरान हर समय सीट बेल्ट बांधकर रखें।" },
    { id: "sg-3", text: "केवल निर्धारित स्टॉप पर ही बस में चढ़ें और उतरें।" },
    {
      id: "sg-4",
      text: "शिष्टता बनाए रखें और आपातकालीन रास्तों को पूरी तरह से साफ रखें।",
    },
  ];
  return lang === "hi" ? listHi : listEn;
};
