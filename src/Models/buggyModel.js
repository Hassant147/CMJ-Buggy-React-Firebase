import moment from 'moment';

class BuggyModel {

    constructor(snapshot, lat, long) {

        // Correct usage of static method
        if (!BuggyModel.validateSnapshot(snapshot)) {
            console.error("Invalid snapshot structure");
            return; // or handle this situation appropriately
        }
        // this.snapshot = snapshot; // Snapshot represents the data fetched from Firestore

        this.leastNewPrice = BuggyModel.getLowestPriceMapForDate(snapshot.Schedule, BuggyModel.formatDateTime(new Date())).newPrice;
        this.leastOldPrice = BuggyModel.getLowestPriceMapForDate(snapshot.Schedule, BuggyModel.formatDateTime(new Date())).oldPrice;
        this.distance = BuggyModel.calculateDistance(snapshot.Location.Lat, snapshot.Location.Long, lat, long);
        this.id = snapshot.id; // Ensure 'id' is provided in the snapshot
        // Fetching all images for all number plates
        this.images = this.getAllImages(snapshot['Plate No With Images']);
        this.isApproved = snapshot['Is Approved']; // Initialize the isApproved property
        this.name = snapshot.Name;
        this.attributes = snapshot.Attributes;
        this.schedule = snapshot.Schedule; // Storing the schedule as is
        this.longitude = snapshot.Location.Long;
        this.latitude = snapshot.Location.Lat;
        this.address = snapshot.Address;
        this.duration = snapshot.Duration;
        this.timeOfDay = snapshot['Time Of Day']; // Adjusted for correct field name
        this.description = snapshot.Description;
        this.model = snapshot.Model;
        this.plateNumber = snapshot['Plate Number']; // Adjusted for correct field name
        this.type = snapshot.Type;
        this.cashierUid = snapshot['Cashier Uid']; // Adjusted for correct field name
        this.cc = parseInt(snapshot.CC, 10); // Added radix parameter
        this.companyUid = snapshot['Company Uid']; // Adjusted for correct field name
        this.horsePower = parseFloat(snapshot['Horse Power']); // Adjusted for correct field name
        this.ratings = BuggyModel.calculateAverageRating(snapshot.Rating);
        this.seats = snapshot.Seats;

        // Calculate the lowest price across all days and slots
        this.calculateLowestPriceOverall();
        // Calculate the lowest price for each specific day
        this.calculateLowestPriceByDate();
    }

    static validateSnapshot(snapshot) {
        // Adjusted to match the Firestore field names
        const requiredFields = [
            'Location', 'Plate No With Images', 'Name', 'Description', 'Schedule',
            'Address', 'Duration', 'Time Of Day', 'Model', 'Plate Number',
            'Type', 'Cashier Uid', 'CC', 'Company Uid', 'Horse Power',
            'Is Approved', 'Seats'
        ];
        return requiredFields.every(field => snapshot.hasOwnProperty(field));
    }

    static calculateAverageRating(ratings) {
        if (!ratings.length) return 0;
        const total = ratings.reduce((sum, { Rating }) => sum + Rating, 0);
        return (total / ratings.length).toFixed(1);
    }

    // Helper method to fetch all images
    getAllImages(plateNoWithImages) {
        let allImages = [];
        // Iterate over each plate number
        Object.keys(plateNoWithImages).forEach(plateNumber => {
            // Get the array of image URLs for each plate number
            const plateImages = plateNoWithImages[plateNumber];
            // Concatenate these URLs with the overall image array
            allImages = allImages.concat(plateImages);
        });
        return allImages;
    }

    static getLowestPriceMapForDate(scheduling, date) {
        const dateEntry = scheduling.find(entry => {
            const dateKey = Object.keys(entry)[0];
            return dateKey === date;
        }) || {};
        if (Object.keys(dateEntry).length === 0) {
            return { newPrice: undefined, oldPrice: undefined };
        }
        const priceMaps = dateEntry[Object.keys(dateEntry)[0]];
        return priceMaps.reduce((lowest, current) => {
            return (lowest.newPrice < current.newPrice) ? lowest : current;
        }, { newPrice: Infinity, oldPrice: Infinity });
    }

    //fetching those slots's dates who are after current time and date.
    // and also showing lowest price of each day.
    //calander
    static getAvailableSlotsWithLowestPrice(schedule) {
        const now = moment();
        return schedule
            .map(entry => {
                const dateKey = Object.keys(entry)[0];
                const slots = entry[dateKey];
                const date = moment(dateKey.split(' - ')[1], 'DD MMM yyyy');

                // Log each dateKey being processed
                // console.log("Processing date:", dateKey);

                if (!date.isSameOrAfter(now, 'day')) {
                    return null;
                }

                let lowestPrice = Infinity;
                slots.forEach(slot => {
                    if (!slot.IsBooked && slot['New Price']) {
                        const newPrice = parseFloat(slot['New Price']);
                        if (!isNaN(newPrice)) {
                            lowestPrice = Math.min(lowestPrice, newPrice);
                        } else {
                            console.error(`Invalid price format for date ${dateKey}: ${slot['New Price']}`);
                        }
                    }
                });

                return lowestPrice !== Infinity
                    ? { date: dateKey, lowestPrice }
                    : { date: dateKey, lowestPrice: undefined };
            })
            .filter(entry => entry !== null)
            .sort((a, b) => moment(a.date, 'DD MMM yyyy').diff(moment(b.date, 'DD MMM yyyy')));
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadius = 6371;
        const dLat = BuggyModel.degreesToRadians(lat2 - lat1);
        const dLon = BuggyModel.degreesToRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(BuggyModel.degreesToRadians(lat1)) * Math.cos(BuggyModel.degreesToRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        return distance.toFixed(2);
    }

    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static formatDateTime(dateTime) {
        return moment(dateTime).format('ddd - DD MMM YYYY'); // Adjust format to match Firestore
    }

    // Method to calculate the lowest price across all slots and days after current date and time of a certain vehicle.
    calculateLowestPriceOverall() {
        let lowestPriceOverall = Infinity;
        let lowestPriceDetails = {};
        const now = moment(); // Current date and time

        // Iterate over each entry in the schedule
        this.schedule.forEach(dateEntry => {
            const dateKey = Object.keys(dateEntry)[0];
            const slotsArray = dateEntry[dateKey];

            if (Array.isArray(slotsArray)) {
                slotsArray.forEach(slot => {
                    const dateTimeString = `${dateKey.split(' - ')[1]} ${slot['End Time']}`;
                    const slotEndTime = moment(dateTimeString, 'DD MMM YYYY hh:mm A');
                    const newPrice = parseFloat(slot['New Price']);
                    const oldPrice = parseFloat(slot['Old Price']); // Capture the old price

                    if (slotEndTime.isAfter(now) && !isNaN(newPrice) && newPrice < lowestPriceOverall) {
                        lowestPriceOverall = newPrice;
                        lowestPriceDetails = {
                            date: dateKey,
                            startTime: slot['Start Time'],
                            endTime: slot['End Time'],
                            newPrice: newPrice, // Store the new price
                            oldPrice: oldPrice  // Store the corresponding old price
                        };
                    }
                });
            } else {
                console.error(`Expected an array of slots for date ${dateKey}, but received:`, dateEntry);
            }
        });

        this.lowestPriceOverall = lowestPriceOverall === Infinity ? undefined : lowestPriceOverall;
        this.lowestPriceOverallDetails = lowestPriceOverall === Infinity ? {} : lowestPriceDetails;
    }

    calculateLowestPriceByDate() {
        this.lowestPriceByDate = {};

        Object.entries(this.schedule).forEach(([date, slotsObj]) => {
            // Access the array within the object
            const slotsArray = slotsObj[Object.keys(slotsObj)[0]];
            if (Array.isArray(slotsArray)) {
                const lowestPriceForDate = slotsArray.reduce((lowest, slot) => {
                    const newPrice = parseFloat(slot['New Price']);
                    return newPrice < lowest ? newPrice : lowest;
                }, Infinity);
                this.lowestPriceByDate[date] = lowestPriceForDate === Infinity ? undefined : lowestPriceForDate;
            } else {
                // If slotsArray is not an array, log the structure to help with debugging
                console.error(`Expected an array of slots for date ${date}, but received:`, slotsObj);
            }
        });
    }

    // Method to calculate available slots for a specific date
    static calculateAvailableBuggiesForDate(schedule, plateNumbers, date) {
        const formattedDate = BuggyModel.formatDateTime(date);
        // console.log('Formatted Date:', formattedDate);

        // Find the correct date entry in the schedule
        const dateEntry = schedule.find(entry => {
            const dateKey = Object.keys(entry)[0];
            return dateKey === formattedDate;
        });

        if (!dateEntry) {
            return [];
        }

        // console.log("Date Entry:", dateEntry); // Debugging log for date entry

        const slots = dateEntry[formattedDate];
        // console.log("Slots for the Date:", slots); // Debugging log for slots

        return slots.map(slot => {
            const totalPlates = plateNumbers.length;
            const bookedPlatesCount = slot['Booked Plate Numbers'] ? slot['Booked Plate Numbers'].length : 0;
            const availableBuggies = totalPlates - bookedPlatesCount;

            // console.log(`Total Plates: ${totalPlates}, Booked Plates: ${bookedPlatesCount}, Available Buggies: ${availableBuggies}`); // Debugging log for each slot

            return {
                ...slot,
                availableBuggies,
            };
        });
    }

    // Method to book buggies
    bookBuggies(date, startTime, quantity) {
        const slots = this.schedule.find(entry => Object.keys(entry)[0] === date);
        if (!slots) {
            return false;
        }

        const slotIndex = slots[Object.keys(slots)[0]].findIndex(slot => slot['Start Time'] === startTime);
        if (slotIndex === -1) {
            return false;
        }

        const slot = slots[Object.keys(slots)[0]][slotIndex];
        const totalBuggies = this.plateNumber.length;
        const bookedBuggies = slot['Booked Plate Numbers'] ? slot['Booked Plate Numbers'].length : 0;

        if (quantity > totalBuggies - bookedBuggies) {
            return false;
        }

        // Logic to select plate numbers to book
        const availablePlates = this.plateNumber.filter(plate => !slot['Booked Plate Numbers'].includes(plate));
        const platesToBook = availablePlates.slice(0, quantity);

        // Update the booked plate numbers
        slot['Booked Plate Numbers'] = [...slot['Booked Plate Numbers'], ...platesToBook];

        // Update the Firestore document (you'll need to implement the actual Firestore update logic)
        // firestore.collection('Buggies').doc(this.id).update({ Schedule: this.schedule });

        return this.updateFirestoreWithBooking(date, startTime, quantity);
    }
}

export default BuggyModel;