import { getDataProvider } from "../data";

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
  const assignment = await provider.getTransportAssignmentByStudent(studentId);
  if (!assignment) return [];

  const alertsList = await provider.getTransportAlerts();
  const alerts = alertsList.filter(
    (al) => al.routeId === assignment.assignedRouteId,
  );

  return alerts.map((al) => ({
    id: al.alertId,
    title:
      al.type === "delay"
        ? lang === "hi"
          ? "मार्ग विलंब सूचना"
          : "Route Status Alert"
        : al.type === "breakdown"
          ? lang === "hi"
            ? "वाहन खराबी अलर्ट"
            : "Vehicle Breakdown Alert"
          : al.type === "diversion"
            ? lang === "hi"
              ? "मार्ग डायवर्जन सूचना"
              : "Route Diversion Warning"
            : al.type === "reassignment"
              ? lang === "hi"
                ? "वाहन पुनर्वितरण सूचना"
                : "Vehicle Reassignment Notice"
              : lang === "hi"
                ? "परिवहन सूचना"
                : "Transport Notice",
    message: lang === "hi" ? al.messageHi : al.messageEn,
    priority: al.severity === "danger" ? "high" : "normal",
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
