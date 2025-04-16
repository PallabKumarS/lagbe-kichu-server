import fs from 'fs';
import path from 'path';
import ListingModel from '../modules/listing/listing.model';
import { TListing } from '../modules/listing/listing.interface';

const seedListings = async () => {
  const count = await ListingModel.countDocuments();
  if (count > 0) {
    console.log('📦 Listings already exist, skipping seeding.');
    return;
  }

  const filePath = path.join(__dirname, '../../../listings.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const listings = JSON.parse(rawData);

  await ListingModel.insertMany(listings as TListing);
  console.log('✅ Listings seeded successfully.');
};

export default seedListings;
