export const enrichHospitals = async (hospitalsList, originCoords) => {
    const directionsService = new window.google.maps.DirectionsService();

    const enrichedList = await Promise.all(
        hospitalsList.map((hospital) =>
            new Promise((resolve) => {
                const dest = new window.google.maps.LatLng(
                    hospital?.geometry?.location?.lat,
                    hospital?.geometry?.location?.lng
                );
 
                const origin = new window.google.maps.LatLng(originCoords.lat, originCoords.lng);

                directionsService.route(
                    {
                        origin,
                        destination: dest,
                        travelMode: "DRIVING",
                    },
                    (result, status) => {
                        if (
                            status === "OK" && result?.routes?.[0]?.legs?.[0]) {
                            const leg = result.routes[0].legs[0];
                            let km = 0;

                            if (leg.distance?.text?.includes("km")) {
                                km = parseFloat(leg.distance.text.replace("km", "").trim());
                            } else if (leg.distance?.text?.includes("m")) {
                                const meters = parseFloat(leg.distance.text.replace("m", "").trim());
                                km = meters / 1000;
                            }

                            resolve({
                                ...hospital,
                                distance: km.toFixed(2),
                                duration: leg.duration.text,
                                cost: `₹${Math.ceil(km * 45)}`
                            });
                        } else {
                            resolve({
                                ...hospital,
                                distance: "N/A",
                                duration: "N/A",
                                cost: "N/A"
                            });
                        }
                    }
                );
            })
        )
    );

    return enrichedList;
};