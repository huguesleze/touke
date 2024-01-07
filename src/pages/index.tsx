import { useState, useCallback, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/router';
import moment from 'moment';
import { GoogleMap, LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

// CSS
import './styles.css';

// Type of any input
type EventInfo = {
  eventName: string;
  organizers: string;
  eventDescription: string;
  eventCategory: string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  startTime: Date | string;
  endTime: Date | string;
  isPublic: boolean;
  address: string;
  eventUrl: string;
};


export default function Home() {
  const [eventName, setEventName] = useState('');
  const [organizers, setOrganizers] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  //const [eventDate, setEventDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [eventUrl, setEventUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [address, setAddress] = useState<string>('');
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const router = useRouter();


  useEffect(() => {
    if (eventName) {
      setEventUrl(generateEventUrl(eventName));
    } else {
      setEventUrl(''); // Reset URL if eventName is cleared
    }
  }, [eventName]);
  
  // Function to generate URL
  const generateEventUrl = (eventName: string) => {
    // Replace spaces with hyphens and remove special characters
    const sanitizedEventName = eventName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    return `www.gooze.fr/${sanitizedEventName}`;
  };

  const url = generateEventUrl(eventName);

  const handleCreateEvent = () => {
    const eventInfo = {
      eventName,
      organizers,
      eventDescription,
      eventCategory,
      //eventDate,
      eventStartDate: moment(startDate).format('LL'), // Format the date
      eventEndDate: moment(endDate).format('LL'), // Format the 
      startTime,
      endTime,
      isPublic,
      address,
      eventUrl: url,
    };

    router.push({
      pathname: '/event-summary',
      query: { eventInfo: JSON.stringify(eventInfo) },
    });
  };

  const handlePlaceSelect = useCallback(() => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        setAddress(places[0].formatted_address);
      }
    }
  }, []);

// Updated onChange handler for DatePicker

const onDateChange = (dates: [Date | null, Date | null]) => {
  const [start, end] = dates;

  if (start && !end) {
    setStartDate(start);
    setEndDate(null); // Reset end date to allow a new range selection
  }

  if (start && end) {
    if (start > end) {
      setStartDate(start);
      setEndDate(start);
    } else {
      setStartDate(start);
      setEndDate(end);
    }
  }
};


  return (
    <div className="form-container">
      <h1>Create Your Event</h1>
      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value ?? '')}
      />
      <br />
      <input
        type="text"
        placeholder="Organizers"
        value={organizers}
        onChange={(e) => setOrganizers(e.target.value ?? '')}
      />
      <br />
      <textarea
        placeholder="Event Description"
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value ?? '')}
      />
      <br />
      <select
        value={eventCategory}
        onChange={(e) => setEventCategory(e.target.value)}
      >
        <option value="">Pick a category</option>
        <option value="music">Party</option>
        <option value="sports">Restaurant</option>
        <option value="conference">Holiday</option>
        <option value="party">Festival</option>
        <option value="other">Other</option>
      </select>
      <br />

      <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={onDateChange}
      dateFormat={"MMMM d, yyyy"}
      isClearable={true}
        //selected={eventDate}
        //onChange={(date) => setEventDate(date || new Date())}
      />
      <br />
      <DatePicker
        selected={startTime}
        onChange={(date) => setStartTime(date || new Date())}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Start Time"
        dateFormat="h:mm aa"
      />
      <br />
      <DatePicker
        selected={endTime}
        onChange={(date) => setEndTime(date || new Date())}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="End Time"
        dateFormat="h:mm aa"
      />
      <br />

<div className="autocomplete-container">
      {/* Google Maps Autocomplete */}
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
      >
        <StandaloneSearchBox
          onLoad={(ref) => searchBoxRef.current = ref}
          onPlacesChanged={handlePlaceSelect}
        >
          <input
            type="text"
            placeholder="Event Address"
            value={address || ''}
            onChange={(e) => setAddress(e.target.value ?? '')}
          />
        </StandaloneSearchBox>
      </LoadScript>
</div>
      <br />

      <div>
        <label>Your Event Link :</label>
        <input 
        type="text"
        value={eventUrl} readOnly
        onChange={(e) => setEventUrl(e.target.value)} />
      </div>

      <label className="switch">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
        />
        <span className="slider round"></span>
      </label>
      <span className="toggle-label">{isPublic ? 'Public' : 'Private'}</span>
      <br />
      <button onClick={handleCreateEvent}>Create My Event</button>
    </div>
  );
}
