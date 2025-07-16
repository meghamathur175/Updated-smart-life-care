export const enrichHospitals = async (hospitalsList, originCoords) => {
  if (!window.google || !window.google.maps) {
    console.warn("❌ Google Maps API not loaded yet.");
    return hospitalsList.map((hospital) => ({
      ...hospital,
      distance: "N/A",
      duration: "N/A",
      cost: "N/A",
    }));
  }

  const directionsService = new window.google.maps.DirectionsService();

  const enrichedList = await Promise.all(
    hospitalsList.map((hospital) =>
      new Promise((resolve) => {
        // ❌ Skip closed hospitals early
        if (
          hospital.business_status === "CLOSED_TEMPORARILY" ||
          hospital.business_status === "CLOSED_PERMANENTLY" ||
          hospital.permanently_closed
        ) {
          return resolve(null);
        }

        const lat = hospital?.geometry?.location?.lat;
        const lng = hospital?.geometry?.location?.lng;

        if (typeof lat !== "number" || typeof lng !== "number") {
          console.warn("❌ Invalid hospital coordinates:", hospital.name);
          return resolve(null); // Filter out invalid hospital
        }

        const dest = new window.google.maps.LatLng(lat, lng);
        const origin = new window.google.maps.LatLng(originCoords.lat, originCoords.lng);

        directionsService.route(
          {
            origin,
            destination: dest,
            travelMode: "DRIVING",
          },
          (result, status) => {
            if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
              const leg = result.routes[0].legs[0];
              let km = 0;

              if (leg.distance?.text?.includes("km")) {
                km = parseFloat(leg.distance.text.replace("km", "").trim());
              } else if (leg.distance?.text?.includes("m")) {
                const meters = parseFloat(leg.distance.text.replace("m", "").trim());
                km = meters / 1000;
              }

              if (km > 5) return resolve(null); // 🚫 Skip hospitals > 5 km

              resolve({
                ...hospital,
                distance: km.toFixed(2),
                duration: leg.duration.text,
                cost: `₹${Math.ceil(km * 45)}`,
              });
            } else {
              resolve(null);
            }
          }
        );
      })
    )
  );

  return enrichedList.filter((h) => h !== null);
};
