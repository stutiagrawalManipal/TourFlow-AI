# TourFlow AI – Backend (Milestone 2)

Small Express server that serves the tourism dataset and a basic digital FIFO queue.

## Run
```
cd backend
npm install
npm run dev        # http://localhost:5000
```
Then, in another terminal, run the frontend from the project root with `npm run dev`.
Vite forwards `/api/*` to this server.

## Structure
```
server.js                  app setup + route mounting
routes/                    URL -> controller mapping
controllers/               read request, validate, send response
services/
  destinationService.js    loads data/india_tourism_dataset.json (read-only)
  queueService.js          FIFO queue logic, saves to data/bookings.json
  crowdService.js          DEMO crowd level from popularity_score (no real sensors yet)
models/
  Destination.js           dataset record -> API shape
  Booking.js               booking shape, statuses, max-4-people rule
data/                      dataset (static) + bookings.json (created at runtime)
```

## API
| Method | URL | Description |
|---|---|---|
| GET | /api/destinations?search=jaipur&state=Rajasthan | List destinations (search + state optional) |
| GET | /api/destinations/states | List of states for the filter |
| GET | /api/destinations/:id | One destination with full details |
| POST | /api/queue | Join queue. Body: `{ "destinationId": 1, "numberOfPeople": 2 }` |
| GET | /api/queue/:bookingId | Booking status, queue position, estimated wait |

`numberOfPeople` must be 1–4. 5 or more returns **400** with
`"A booking can contain a maximum of 4 people."`

Estimated wait = people ahead in the queue × 2 minutes (demo formula).
To reset the queue, stop the server and delete `data/bookings.json`.
