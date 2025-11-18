/*
  Fixes brand names (Hyundai, Kia) and inserts additional non-Toyota vehicles.
  Usage:
    DATABASE_URL=postgresql://... node scripts/fix-brands-and-add.cjs
*/
const { neon, neonConfig } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

neonConfig.fetchConnectionCache = true;
const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('🚗 Fixing brand names and inserting additional vehicles...');

  // Fix brand names for existing rows
  await sql`update "Vehicle" set name='Hyundai Tucson' where name ilike 'Toyota Tucson%';`;
  await sql`update "Vehicle" set name='Hyundai Sonata' where name ilike 'Toyota Sonata%';`;
  await sql`update "Vehicle" set name='Kia Sorento' where name ilike 'Toyota Sorento%';`;
  await sql`update "Vehicle" set name='Kia K5 Optima' where name ilike 'Toyota KI 5%' or name ilike 'KIA SORENTO%';`;

  // Insert additional non-Toyota vehicles
  await sql`
    insert into "Vehicle"
      (name,image,type,category,price,year,engine,mileage,transmission,fuel,capacity,doors,description,isAvailable,power,fuelEfficiency,quantity,status,licensePlate,vehicleId)
    values
      ('Hyundai Santa Fe','/vehicles/SORENTO.png','SUV','Premium','85,000',2023,'2.5L 4C','22,000 km','Automatic','Petrol','7 passengers',5,'Spacious family SUV',true,'191 HP','9.0 L/100km',1,'available','RB123','SANTAFE-001'),
      ('Kia Sportage','/vehicles/TUCSON.png','SUV','Compact','65,000',2022,'2.0L 4C','28,000 km','Automatic','Petrol','5 passengers',5,'Compact SUV',true,'155 HP','7.9 L/100km',1,'available','RB124','SPORTAGE-001'),
      ('Nissan X-Trail','/vehicles/RAV 4.png','SUV','Premium','75,000',2022,'2.5L 4C','30,000 km','CVT','Petrol','7 passengers',5,'7-seat SUV',true,'169 HP','8.6 L/100km',1,'available','RB125','XTRAIL-001'),
      ('Mercedes Sprinter','/vehicles/COASTER.png','Van','Commercial','140,000',2021,'2.1L Diesel','40,000 km','Automatic','Diesel','14 passengers',3,'Premium passenger van',true,'161 HP','10.5 L/100km',1,'available','RB126','SPRINTER-001'),
      ('Mitsubishi Pajero','/vehicles/TXL.png','SUV','Off-road','95,000',2021,'3.5L V6','35,000 km','Automatic','Petrol','7 passengers',5,'Off-road capable SUV',true,'184 HP','12.0 L/100km',1,'available','RB127','PAJERO-001'),
      ('Honda CR-V','/vehicles/RAV 4.png','SUV','Compact','70,000',2022,'1.5L Turbo','26,000 km','CVT','Petrol','5 passengers',5,'Reliable compact SUV',true,'190 HP','7.4 L/100km',1,'available','RB128','CRV-001')
    on conflict do nothing;
  `;

  const rows = await sql`select count(*)::int as count from "Vehicle"`;
  console.log('✅ Vehicles count:', rows[0].count);
}

main().catch((e) => { console.error(e); process.exit(1); });



