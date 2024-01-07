import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import moment from 'moment';
import './styles.css';


interface Car {
  driver: string;
  carpoolers: string[];
  seats : number;
  availableSeats: () => number;
}

interface EventData {
  eventName: string;
  organizers: string;
  eventDescription: string;
  eventCategory: string;
  eventStartDate: string;
  eventEndDate: string;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  address: string;
  eventUrl: string;
  location: { lat: number; lng: number } | null;
}


export default function EventSummary() {
  const router = useRouter();
  const [eventData, setEventData] = useState<EventData>({
    eventName: '',
    organizers: '',
    eventDescription: '',
    eventCategory: '',
    eventStartDate: '',
    eventEndDate: '',
    startTime: '', 
    endTime: '',
    isPublic: true,
    address: '',
    eventUrl:'',
    location: null
  });

  const [mapCenter, setMapCenter] = useState({ lat: -34.397, lng: 150.644 });


  useEffect(() => {
    if (router.isReady) {
      const { eventInfo } = router.query;
      if (typeof eventInfo === 'string') {
        const parsedEventInfo = JSON.parse(eventInfo);
        // CONSOLE LOG
        console.log("Parsed Event Info:", parsedEventInfo);

        // Assuming eventDate, startTime, and endTime are ISO string dates in eventInfo
        //parsedEventInfo.eventDate = parsedEventInfo.eventDate ? moment(parsedEventInfo.eventDate).format('LL') : '';
        parsedEventInfo.eventStartDate = parsedEventInfo.eventStartDate ? moment(parsedEventInfo.eventStartDate).format('LL') : '';
        parsedEventInfo.eventEndDate = parsedEventInfo.eventEndDate ? moment(parsedEventInfo.eventEndDate).format('LL') : '';
        parsedEventInfo.startTime = parsedEventInfo.startTime ? moment(parsedEventInfo.startTime).format('LT') : '';
        parsedEventInfo.endTime = parsedEventInfo.endTime ? moment(parsedEventInfo.endTime).format('LT') : '';

        setEventData(parsedEventInfo);

        // Geocode the address
        if (parsedEventInfo.address) {
            geocodeAddress(parsedEventInfo.address);
        }
      }
    }
  }, [router.isReady, router.query]);

  const geocodeAddress = (address : string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Mpas API is not defined in envrionment variables");
        return;
    }
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                setMapCenter(location);
            }
        }).catch(error => {
            console.error('Geocoding error:', error);
        })
  }

  // Car Pooling

  const [cars, setCars] = useState<Car[]>([]);
  const [newCarName, setNewCarName] = useState<string>('');
  const [newCarSeats, setNewCarSeats] = useState<number>(4);
  const [carpoolerInputs, setCarpoolerInputs] = useState<{ [index: number]: string }>({});
  const [carpoolerNames, setCarpoolerNames] = useState<{ [key:number]: string}>({});
  const deleteCar = (carIndex: number): void => {
    const updatedCars = [...cars.slice(0,carIndex), ...cars.slice(carIndex + 1)];
    setCars(updatedCars);
  };

  const deleteCarpooler = (carIndex: number, carpoolerIndex: number): void => {
    const updatedCars: Car[] = [...cars];
    const selectedCar: Car = updatedCars[carIndex];
    selectedCar.carpoolers = [
      ...selectedCar.carpoolers.slice(0, carpoolerIndex),
      ...selectedCar.carpoolers.slice(carpoolerIndex + 1)
    ];
    setCars(updatedCars);
  };

  const addCar = (): void => {
    if (newCarName && newCarSeats > 0 && !cars.some(car => car.driver === newCarName)) {
      setCars([...cars, { 
        driver: newCarName, 
        carpoolers: [], 
        seats: newCarSeats,
        availableSeats: function() { return this.seats - this.carpoolers.length; }
      }]);
      setNewCarName('');
      setNewCarSeats(4); // Reset to default value
    } else {
      alert('Please enter a unique car name and the number of seats.');
    }
  };

  const handleCarpoolerInputChange = (carIndex: number, value: string) => {
  setCarpoolerInputs({ ...carpoolerInputs, [carIndex]: value });
};
  
const addCarpooler = (carIndex: number): void => {
  const carpoolerName = carpoolerInputs[carIndex] || "";
  const selectedCar = cars[carIndex];
  if (carpoolerName && selectedCar.availableSeats() > 0) {
    const updatedCars: Car[] = [...cars];
    const selectedCar: Car = updatedCars[carIndex];

    if (!selectedCar.carpoolers.includes(carpoolerName)) {
      selectedCar.carpoolers.push(carpoolerName);
      setCars(updatedCars);
      // Clear the carpooler input for this car
      setCarpoolerInputs({ ...carpoolerInputs, [carIndex]: '' });
    } else {
      alert('This carpooler has already joined.');
    }
  } else {
    alert('No carp name or no available seats or invalid carpooler name.');
  }
};

  

  return (
    <div className="event-summary-container">
      <h1>Event Summary</h1>
  
      <div className="google-map-container">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={14}
                options={{
                  streetViewControl: false,
                  scaleControl: false,
                  mapTypeControl: false,
                  panControl: false,
                  zoomControl: false,
                  rotateControl: false,
                  fullscreenControl: false
                }}
            >
              {mapCenter && <Marker position={mapCenter} />}
            </GoogleMap>
            <div className="map-address-label">{eventData.address}</div>
          </LoadScript>
        )}
      </div>
  
      <p><strong>Event Name:</strong> {eventData.eventName}</p>
      <p><strong>Organizers:</strong> {eventData.organizers}</p>
      <p><strong>Description:</strong> {eventData.eventDescription}</p>
      <p><strong>Category:</strong> {eventData.eventCategory}</p>
      <p><strong>Begin Date:</strong> {eventData.eventStartDate}</p>
      <p><strong>End Date:</strong> {eventData.eventEndDate}</p>
      <p><strong>Start Time:</strong> {eventData.startTime}</p>
      <p><strong>End Time:</strong> {eventData.endTime}</p>
      <p><strong>Event Url:</strong> {eventData.eventUrl}</p>
      <p><strong>Event Privacy:</strong> {eventData.isPublic ? 'Public' : 'Private'}</p>


      <div className="carpool-container">
    <h1>Transport</h1>

    {/* Inputs for adding new car and carpooler */}
    <div className="car-inputs">
      <input 
        type="text" 
        placeholder="Driver's name for new car" 
        value={newCarName} 
        onChange={(e) => setNewCarName(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Number of seats"
        value={newCarSeats}
        onChange={(e) => setNewCarSeats(parseInt(e.target.value) || 0)}
        min="1" 
      />
      <button onClick={addCar}>Add Car</button>
    </div>

    {/* Display cars only if there are any */}
    {cars.map((car, carIndex) => (
      <div key={carIndex} className="car-card">
        <div className="car-driver">
          {car.driver}
          <span className="delete-button" onClick={() => deleteCar(carIndex)}>D</span>
        </div>
        <div className="car details">
          Seats: {car.seats} (Available: {car.availableSeats()})
          </div>
        {/* Carpoolers and input to add carpooler */}
        {car.carpoolers.map((carpooler, carpoolerIndex) => (
          <div key={carpoolerIndex} className="car-carpooler">
            {carpooler}
            <span className="delete-button" onClick={() => deleteCarpooler(carIndex, carpoolerIndex)}>D</span>
          </div>
        ))}
        {car.availableSeats() > 0 && (
        <div className="add-carpooler-input">
          <input 
            type="text" 
            placeholder="Carpooler's name" 
            value={carpoolerInputs[carIndex] || ''}
            onChange={(e) => handleCarpoolerInputChange(carIndex, e.target.value)}
            //onChange={(e) => setNewCarpoolerName(e.target.value)} 
          />
          <button onClick={() => addCarpooler(carIndex)}>Add Carpooler</button>
        </div>
        )}
      </div>
    ))}
  </div>


  </div>
  );
  
}
