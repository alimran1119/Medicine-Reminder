import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CatalogItem from '../src/models/CatalogItem.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medreminder';

const seed = [
  "Paracetamol 500 mg","Ibuprofen 200 mg","Aspirin 75 mg","Cetirizine 10 mg","Loratadine 10 mg",
  "Azithromycin 500 mg","Amoxicillin 500 mg","Metformin 500 mg","Omeprazole 20 mg","Pantoprazole 40 mg",
  "Atorvastatin 10 mg","Rosuvastatin 10 mg","Losartan 50 mg","Amlodipine 5 mg","Metoprolol 50 mg",
  "Bisoprolol 5 mg","Telmisartan 40 mg","Gliclazide 80 mg","Glimipiride 2 mg","Insulin (Regular)",
  "Insulin (Glargine)","Folic Acid 5 mg","Vitamin B Complex","Vitamin D3 2000 IU","Calcium 500 mg",
  "Magnesium 250 mg","Zinc 20 mg","Ascorbic Acid 500 mg","Esomeprazole 40 mg","Domperidone 10 mg",
  "Ondansetron 4 mg","Drotaverine 80 mg","Hyoscine 10 mg","Salbutamol Inhaler","Budesonide Inhaler",
  "Montelukast 10 mg","Levocetirizine 5 mg","Diphenhydramine 25 mg","Chlorpheniramine 4 mg","Dextromethorphan Syrup",
  "Ambroxol Syrup","ORS Sachet","Loperamide 2 mg","Probiotic Capsules","Multivitamin",
  "Ferrous Sulfate 325 mg","Thyroxine 50 mcg","Thyroxine 100 mcg","Dapagliflozin 10 mg","Empagliflozin 10 mg",
  "Clopidogrel 75 mg","Aspirin+Clopidogrel","Warfarin 5 mg","Apixaban 5 mg","Rivaroxaban 10 mg",
  "Diazepam 5 mg","Sertraline 50 mg","Escitalopram 10 mg","Amitriptyline 10 mg","Rabeprazole 20 mg",
  "Sodium Alginate","Sucralfate Syrup","Metronidazole 400 mg","Ciprofloxacin 500 mg","Levofloxacin 500 mg",
  "Doxycycline 100 mg","Clarithromycin 500 mg","Cefixime 200 mg","Cefuroxime 500 mg","Ceftriaxone Injection",
  "Amikacin Injection","Diclofenac 50 mg","Naproxen 500 mg","Tramadol 50 mg","Pregabalin 75 mg",
  "Gabapentin 300 mg","Tizanidine 2 mg","Cyclobenzaprine 10 mg","Betamethasone Cream","Miconazole Cream",
  "Clotrimazole Cream","Hydrocortisone Cream","Ketoconazole Shampoo","Minoxidil Topical","Isotretinoin 20 mg",
  "Tretinoin Cream","Benzoyl Peroxide Gel","Salicylic Acid Face Wash","Oral Contraceptive","Prenatal Vitamin",
  "Pediatric Paracetamol Syrup","Zinc Syrup","Lactulose Syrup","Bisacodyl 5 mg","Sodium Picosulfate Drops",
  "Sennosides Syrup","Pantoprazole+Domperidone","Thiamine 100 mg","Niacin 500 mg","Vitamin E 400 IU",
  "Omega-3 Fish Oil","Coenzyme Q10 100 mg","Milk Thistle Extract"
];

while (seed.length < 120) seed.push(`Generic Medicine ${seed.length+1} 500 mg`);

const items = seed.map(n => ({ name: n, priceBdt: Math.floor(30 + Math.random()*1200), photoUrl: '' }));

(async () => {
  await mongoose.connect(MONGODB_URI);
  await CatalogItem.deleteMany({});
  await CatalogItem.insertMany(items);
  console.log('Seeded', items.length, 'catalog items');
  process.exit(0);
})();
