import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ArrowRight,
  Bus,
  Calendar,
  Car,
  Check,
  Clock,
  Heart,
  Loader2,
  MapPin,
  Plane,
  Train,
} from "lucide-react";
import { submitRsvp, updateRsvp, checkRsvpExists } from "@/lib/rsvp.functions";
import { CornerFlourishes, Divider } from "./Ornaments";

const STORAGE_KEY = "pn-rsvp";

const POPULAR_CITIES = [
	"Achalpur",
  "Achhnera",
  "Adalaj",
  "Adilabad",
  "Adityapur",
  "Adoni",
  "Adoor",
  "Adra",
  "Adyar",
  "Afzalpur",
  "Agartala",
  "Agra",
  "Ahmedabad",
  "Ahmednagar",
  "Aizawl",
  "Ajmer",
  "Akola",
  "Akot",
  "Alappuzha",
  "Aligarh",
  "AlipurdUrban Agglomerationr",
  "Alirajpur",
  "Allahabad",
  "Alwar",
  "Amalapuram",
  "Amalner",
  "Ambejogai",
  "Ambikapur",
  "Amravati",
  "Amreli",
  "Amritsar",
  "Amroha",
  "Anakapalle",
  "Anand",
  "Anantapur",
  "Anantnag",
  "Anjangaon",
  "Anjar",
  "Ankleshwar",
  "Arakkonam",
  "Arambagh",
  "Araria",
  "Arrah",
  "Arsikere",
  "Aruppukkottai",
  "Arvi",
  "Arwal",
  "Asansol",
  "Asarganj",
  "Ashok Nagar",
  "Athni",
  "Attingal",
  "Aurangabad",
  "Aurangabad",
  "Azamgarh",
  "Bagaha",
  "Bageshwar",
  "Bahadurgarh",
  "Baharampur",
  "Bahraich",
  "Balaghat",
  "Balangir",
  "Baleshwar Town",
  "Ballari",
  "Balurghat",
  "Bankura",
  "Bapatla",
  "Baramula",
  "Barbil",
  "Bargarh",
  "Barh",
  "Baripada Town",
  "Barmer",
  "Barnala",
  "Barpeta",
  "Batala",
  "Bathinda",
  "Begusarai",
  "Belagavi",
  "Bellampalle",
  "Belonia",
  "Banglore/Bengaluru",
  "Bettiah",
  "BhabUrban Agglomeration",
  "Bhadrachalam",
  "Bhadrak",
  "Bhagalpur",
  "Bhainsa",
  "Bharatpur",
  "Bharuch",
  "Bhatapara",
  "Bhavnagar",
  "Bhawanipatna",
  "Bheemunipatnam",
  "Bhilai Nagar",
  "Bhilwara",
  "Bhimavaram",
  "Bhiwandi",
  "Bhiwani",
  "Bhongir",
  "Bhopal",
  "Bhubaneswar",
  "Bhuj",
  "Bikaner",
  "Bilaspur",
  "Bobbili",
  "Bodhan",
  "Bokaro Steel City",
  "Bongaigaon City",
  "Brahmapur",
  "Buxar",
  "Byasanagar",
  "Chaibasa",
  "Chalakudy",
  "Chandausi",
  "Chandigarh",
  "Changanassery",
  "Charkhi Dadri",
  "Chatra",
  "Chennai",
  "Cherthala",
  "Chhapra",
  "Chhapra",
  "Chikkamagaluru",
  "Chilakaluripet",
  "Chirala",
  "Chirkunda",
  "Chirmiri",
  "Chittoor",
  "Chittur-Thathamangalam",
  "Coimbatore",
  "Cuttack",
  "Dalli-Rajhara",
  "Darbhanga",
  "Darjiling",
  "Davanagere",
  "Deesa",
  "Dehradun",
  "Dehri-on-Sone",
  "Delhi",
  "Deoghar",
  "Dhamtari",
  "Dhanbad",
  "Dharmanagar",
  "Dharmavaram",
  "Dhenkanal",
  "Dhoraji",
  "Dhubri",
  "Dhule",
  "Dhuri",
  "Dibrugarh",
  "Dimapur",
  "Diphu",
  "Dumka",
  "Dumraon",
  "Durg",
  "Eluru",
  "English Bazar",
  "Erode",
  "Etawah",
  "Faridabad",
  "Faridkot",
  "Farooqnagar",
  "Fatehabad",
  "Fatehpur Sikri",
  "Fazilka",
  "Firozabad",
  "Firozpur Cantt.",
  "Firozpur",
  "Forbesganj",
  "Gadwal",
  "Gandhinagar",
  "Gangarampur",
  "Ganjbasoda",
  "Gaya",
  "Giridih",
  "Goalpara",
  "Gobichettipalayam",
  "Gobindgarh",
  "Godhra",
  "Gohana",
  "Gokak",
  "Gooty",
  "Gopalganj",
  "Gudivada",
  "Gudur",
  "Gumia",
  "Guntakal",
  "Guntur",
  "Gurdaspur",
  "Gurgaon",
  "Guruvayoor",
  "Guwahati",
  "Gwalior",
  "Habra",
  "Hajipur",
  "Haldwani-cum-Kathgodam",
  "Hansi",
  "Hapur",
  "Hardoi ",
  "Hardwar",
  "Hazaribag",
  "Hindupur",
  "Hisar",
  "Hoshiarpur",
  "Hubli-Dharwad",
  "Hugli-Chinsurah",
  "Hyderabad",
  "Ichalkaranji",
  "Imphal",
  "Indore",
  "Itarsi",
  "Jabalpur",
  "Jagdalpur",
  "Jaggaiahpet",
  "Jagraon",
  "Jagtial",
  "Jaipur",
  "Jalandhar Cantt.",
  "Jalandhar",
  "Jalpaiguri",
  "Jamalpur",
  "Jammalamadugu",
  "Jammu",
  "Jamnagar",
  "Jamshedpur",
  "Jamui",
  "Jangaon",
  "Jatani",
  "Jehanabad",
  "Jhansi",
  "Jhargram",
  "Jharsuguda",
  "Jhumri Tilaiya",
  "Jind",
  "Jodhpur",
  "Jorhat",
  "Kadapa",
  "Kadi",
  "Kadiri",
  "Kagaznagar",
  "Kailasahar",
  "Kaithal",
  "Kakinada",
  "Kalimpong",
  "Kalpi",
  "Kalyan-Dombivali",
  "Kamareddy",
  "Kancheepuram",
  "Kandukur",
  "Kanhangad",
  "Kannur",
  "Kanpur",
  "Kapadvanj",
  "Kapurthala",
  "Karaikal",
  "Karimganj",
  "Karimnagar",
  "Karjat",
  "Karnal",
  "Karur",
  "Karwar",
  "Kasaragod",
  "Kashipur",
  "KathUrban Agglomeration",
  "Katihar",
  "Kavali",
  "Kayamkulam",
  "Kendrapara",
  "Kendujhar",
  "Keshod",
  "Khair",
  "Khambhat",
  "Khammam",
  "Khanna",
  "Kharagpur",
  "Kharar",
  "Khowai",
  "Kishanganj",
  "Kochi",
  "Kodungallur",
  "Kohima",
  "Kolar",
  "Kolkata",
  "Kollam",
  "Koratla",
  "Korba",
  "Kot Kapura",
  "Kota",
  "Kothagudem",
  "Kottayam",
  "Kovvur",
  "Koyilandy",
  "Kozhikode",
  "Kunnamkulam",
  "Kurnool",
  "Kyathampalle",
  "Lachhmangarh",
  "Ladnu",
  "Ladwa",
  "Lahar",
  "Laharpur",
  "Lakheri",
  "Lakhimpur",
  "Lakhisarai",
  "Lakshmeshwar",
  "Lal Gopalganj Nindaura",
  "Lalganj",
  "Lalganj",
  "Lalgudi",
  "Lalitpur",
  "Lalsot",
  "Lanka",
  "Lar",
  "Lathi",
  "Latur",
  "Lilong",
  "Limbdi",
  "Lingsugur",
  "Loha",
  "Lohardaga",
  "Lonar",
  "Lonavla",
  "Longowal",
  "Loni",
  "Losal",
  "Lucknow",
  "Ludhiana",
  "Lumding",
  "Lunawada",
  "Lunglei",
  "Macherla",
  "Machilipatnam",
  "Madanapalle",
  "Maddur",
  "Madhepura",
  "Madhubani",
  "Madhugiri",
  "Madhupur",
  "Madikeri",
  "Madurai",
  "Magadi",
  "Mahad",
  "Mahalingapura",
  "Maharajganj",
  "Maharajpur",
  "Mahasamund",
  "Mahbubnagar",
  "Mahe",
  "Mahemdabad",
  "Mahendragarh",
  "Mahesana",
  "Mahidpur",
  "Mahnar Bazar",
  "Mahuva",
  "Maihar",
  "Mainaguri",
  "Makhdumpur",
  "Makrana",
  "Malaj Khand",
  "Malappuram",
  "Malavalli",
  "Malda",
  "Malegaon",
  "Malerkotla",
  "Malkangiri",
  "Malkapur",
  "Malout",
  "Malpura",
  "Malur",
  "Manachanallur",
  "Manasa",
  "Manavadar",
  "Manawar",
  "Mancherial",
  "Mandalgarh",
  "Mandamarri",
  "Mandapeta",
  "Mandawa",
  "Mandi Dabwali",
  "Mandi",
  "Mandideep",
  "Mandla",
  "Mandsaur",
  "Mandvi",
  "Mandya",
  "Manendragarh",
  "Maner",
  "Mangaldoi",
  "Mangaluru",
  "Mangalvedhe",
  "Manglaur",
  "Mangrol",
  "Mangrol",
  "Mangrulpir",
  "Manihari",
  "Manjlegaon",
  "Mankachar",
  "Manmad",
  "Mansa",
  "Mansa",
  "Manuguru",
  "Manvi",
  "Manwath",
  "Mapusa",
  "Margao",
  "Margherita",
  "Marhaura",
  "Mariani",
  "Marigaon",
  "Markapur",
  "Marmagao",
  "Masaurhi",
  "Mathabhanga",
  "Mathura",
  "Mattannur",
  "Mauganj",
  "Mavelikkara",
  "Mavoor",
  "Mayang Imphal",
  "Medak",
  "Medininagar (Daltonganj)",
  "Medinipur",
  "Meerut",
  "Mehkar",
  "Memari",
  "Merta City",
  "Mhaswad",
  "Mhow Cantonment",
  "Mhowgaon",
  "Mihijam",
  "Mira-Bhayandar",
  "Mirganj",
  "Miryalaguda",
  "Modasa",
  "Modinagar",
  "Moga",
  "Mohali",
  "Mokameh",
  "Mokokchung",
  "Monoharpur",
  "Moradabad",
  "Morena",
  "Morinda, India",
  "Morshi",
  "Morvi",
  "Motihari",
  "Motipur",
  "Mount Abu",
  "Mudabidri",
  "Mudalagi",
  "Muddebihal",
  "Mudhol",
  "Mukerian",
  "Mukhed",
  "Muktsar",
  "Mul",
  "Mulbagal",
  "Multai",
  "Mumbai",
  "Mundargi",
  "Mundi",
  "Mungeli",
  "Munger",
  "Murliganj",
  "Murshidabad",
  "Murtijapur",
  "Murwara (Katni)",
  "Musabani",
  "Mussoorie",
  "Muvattupuzha",
  "Muzaffarpur",
  "Mysore",
  "Nabadwip",
  "Nabarangapur",
  "Nabha",
  "Nadbai",
  "Nadiad",
  "Nagaon",
  "Nagapattinam",
  "Nagar",
  "Nagari",
  "Nagarkurnool",
  "Nagaur",
  "Nagda",
  "Nagercoil",
  "Nagina",
  "Nagla",
  "Nagpur",
  "Nahan",
  "Naharlagun",
  "Naidupet",
  "Naihati",
  "Naila Janjgir",
  "Nainital",
  "Nainpur",
  "Najibabad",
  "Nakodar",
  "Nakur",
  "Nalbari",
  "Namagiripettai",
  "Namakkal",
  "Nanded-Waghala",
  "Nandgaon",
  "Nandivaram-Guduvancheri",
  "Nandura",
  "Nandurbar",
  "Nandyal",
  "Nangal",
  "Nanjangud",
  "Nanjikottai",
  "Nanpara",
  "Narasapuram",
  "Narasaraopet",
  "Naraura",
  "Narayanpet",
  "Nargund",
  "Narkatiaganj",
  "Narkhed",
  "Narnaul",
  "Narsinghgarh",
  "Narsinghgarh",
  "Narsipatnam",
  "Narwana",
  "Nashik",
  "Nasirabad",
  "Natham",
  "Nathdwara",
  "Naugachhia",
  "Naugawan Sadat",
  "Nautanwa",
  "Navalgund",
  "Navsari",
  "Nawabganj",
  "Nawada",
  "Nawanshahr",
  "Nawapur",
  "Nedumangad",
  "Neem-Ka-Thana",
  "Neemuch",
  "Nehtaur",
  "Nelamangala",
  "Nellikuppam",
  "Nellore",
  "Nepanagar",
  "New Delhi",
  "Neyveli (TS)",
  "Neyyattinkara",
  "Nidadavole",
  "Nilambur",
  "Nilanga",
  "Nimbahera",
  "Nirmal",
  "Niwai",
  "Niwari",
  "Nizamabad",
  "Nohar",
  "Noida",
  "Nokha",
  "Nokha",
  "Nongstoin",
  "Noorpur",
  "North Lakhimpur",
  "Nowgong",
  "Nowrozabad (Khodargama)",
  "Nuzvid",
  "O' Valley",
  "Obra",
  "Oddanchatram",
  "Ongole",
  "Orai",
  "Osmanabad",
  "Ottappalam",
  "Ozar",
  "P.N.Patti",
  "Pachora",
  "Pachore",
  "Pacode",
  "Padmanabhapuram",
  "Padra",
  "Padrauna",
  "Paithan",
  "Pakaur",
  "Palacole",
  "Palai",
  "Palakkad",
  "Palampur",
  "Palani",
  "Palanpur",
  "Palasa Kasibugga",
  "Palghar",
  "Pali",
  "Pali",
  "Palia Kalan",
  "Palitana",
  "Palladam",
  "Pallapatti",
  "Pallikonda",
  "Palwal",
  "Palwancha",
  "Panagar",
  "Panagudi",
  "Panaji",
  "Panamattom",
  "Panchkula",
  "Panchla",
  "Pandharkaoda",
  "Pandharpur",
  "Pandhurna",
  "PandUrban Agglomeration",
  "Panipat",
  "Panna",
  "Panniyannur",
  "Panruti",
  "Panvel",
  "Pappinisseri",
  "Paradip",
  "Paramakudi",
  "Parangipettai",
  "Parasi",
  "Paravoor",
  "Parbhani",
  "Pardi",
  "Parlakhemundi",
  "Parli",
  "Partur",
  "Parvathipuram",
  "Pasan",
  "Paschim Punropara",
  "Pasighat",
  "Patan",
  "Pathanamthitta",
  "Pathankot",
  "Pathardi",
  "Pathri",
  "Patiala",
  "Patna",
  "Patratu",
  "Pattamundai",
  "Patti",
  "Pattran",
  "Pattukkottai",
  "Patur",
  "Pauni",
  "Pauri",
  "Pavagada",
  "Pedana",
  "Peddapuram",
  "Pehowa",
  "Pen",
  "Perambalur",
  "Peravurani",
  "Peringathur",
  "Perinthalmanna",
  "Periyakulam",
  "Periyasemur",
  "Pernampattu",
  "Perumbavoor",
  "Petlad",
  "Phagwara",
  "Phalodi",
  "Phaltan",
  "Phillaur",
  "Phulabani",
  "Phulera",
  "Phulpur",
  "Phusro",
  "Pihani",
  "Pilani",
  "Pilibanga",
  "Pilibhit",
  "Pilkhuwa",
  "Pindwara",
  "Pinjore",
  "Pipar City",
  "Pipariya",
  "Piriyapatna",
  "Piro",
  "Pithampur",
  "Pithapuram",
  "Pithoragarh",
  "Pollachi",
  "Polur",
  "Pondicherry",
  "Ponnani",
  "Ponneri",
  "Ponnur",
  "Porbandar",
  "Porsa",
  "Port Blair",
  "Powayan",
  "Prantij",
  "Pratapgarh",
  "Pratapgarh",
  "Prithvipur",
  "Proddatur",
  "Pudukkottai",
  "Pudupattinam",
  "Pukhrayan",
  "Pulgaon",
  "Puliyankudi",
  "Punalur",
  "Punch",
  "Pune",
  "Punganur",
  "Punjaipugalur",
  "Puranpur",
  "Puri",
  "Purna",
  "Purnia",
  "PurqUrban Agglomerationzi",
  "Purulia",
  "Purwa",
  "Pusad",
  "Puthuppally",
  "Puttur",
  "Puttur",
  "Qadian",
  "Raayachuru",
  "Rabkavi Banhatti",
  "Radhanpur",
  "Rae Bareli",
  "Rafiganj",
  "Raghogarh-Vijaypur",
  "Raghunathganj",
  "Raghunathpur",
  "Rahatgarh",
  "Rahuri",
  "Raiganj",
  "Raigarh",
  "Raikot",
  "Raipur",
  "Rairangpur",
  "Raisen",
  "Raisinghnagar",
  "Rajagangapur",
  "Rajahmundry",
  "Rajakhera",
  "Rajaldesar",
  "Rajam",
  "Rajampet",
  "Rajapalayam",
  "Rajauri",
  "Rajgarh (Alwar)",
  "Rajgarh (Churu)",
  "Rajgarh",
  "Rajgir",
  "Rajkot",
  "Rajnandgaon",
  "Rajpipla",
  "Rajpura",
  "Rajsamand",
  "Rajula",
  "Rajura",
  "Ramachandrapuram",
  "Ramagundam",
  "Ramanagaram",
  "Ramanathapuram",
  "Ramdurg",
  "Rameshwaram",
  "Ramganj Mandi",
  "Ramgarh",
  "Ramnagar",
  "Ramnagar",
  "Ramngarh",
  "Rampur Maniharan",
  "Rampur",
  "Rampura Phul",
  "Rampurhat",
  "Ramtek",
  "Ranaghat",
  "Ranavav",
  "Ranchi",
  "Ranebennuru",
  "Rangia",
  "Rania",
  "Ranibennur",
  "Ranipet",
  "Rapar",
  "Rasipuram",
  "Rasra",
  "Ratangarh",
  "Rath",
  "Ratia",
  "Ratlam",
  "Ratnagiri",
  "Rau",
  "Raurkela",
  "Raver",
  "Rawatbhata",
  "Rawatsar",
  "Raxaul Bazar",
  "Rayachoti",
  "Rayadurg",
  "Rayagada",
  "Reengus",
  "Rehli",
  "Renigunta",
  "Renukoot",
  "Reoti",
  "Repalle",
  "Revelganj",
  "Rewa",
  "Rewari",
  "Rishikesh",
  "Risod",
  "Robertsganj",
  "Robertson Pet",
  "Rohtak",
  "Ron",
  "Roorkee",
  "Rosera",
  "Rudauli",
  "Rudrapur",
  "Rudrapur",
  "Rupnagar",
  "Sabalgarh",
  "Sadabad",
  "Sadalagi",
  "Sadasivpet",
  "Sadri",
  "Sadulpur",
  "Sadulshahar",
  "Safidon",
  "Safipur",
  "Sagar",
  "Sagara",
  "Sagwara",
  "Saharanpur",
  "Saharsa",
  "Sahaspur",
  "Sahaswan",
  "Sahawar",
  "Sahibganj",
  "Sahjanwa",
  "Saidpur",
  "Saiha",
  "Sailu",
  "Sainthia",
  "Sakaleshapura",
  "Sakti",
  "Salaya",
  "Salem",
  "Salur",
  "Samalkha",
  "Samalkot",
  "Samana",
  "Samastipur",
  "Sambalpur",
  "Sambhal",
  "Sambhar",
  "Samdhan",
  "Samthar",
  "Sanand",
  "Sanawad",
  "Sanchore",
  "Sandi",
  "Sandila",
  "Sanduru",
  "Sangamner",
  "Sangareddy",
  "Sangaria",
  "Sangli",
  "Sangole",
  "Sangrur",
  "Sankarankovil",
  "Sankari",
  "Sankeshwara",
  "Santipur",
  "Sarangpur",
  "Sardarshahar",
  "Sardhana",
  "Sarni",
  "Sarsod",
  "Sasaram",
  "Sasvad",
  "Satana",
  "Satara",
  "Sathyamangalam",
  "Satna",
  "Sattenapalle",
  "Sattur",
  "Saunda",
  "Saundatti-Yellamma",
  "Sausar",
  "Savanur",
  "Savarkundla",
  "Savner",
  "Sawai Madhopur",
  "Sawantwadi",
  "Sedam",
  "Sehore",
  "Sendhwa",
  "Seohara",
  "Seoni",
  "Seoni-Malwa",
  "Shahabad",
  "Shahabad, Hardoi",
  "Shahabad, Rampur",
  "Shahade",
  "Shahbad",
  "Shahdol",
  "Shahganj",
  "Shahjahanpur",
  "Shahpur",
  "Shahpura",
  "Shahpura",
  "Shajapur",
  "Shamgarh",
  "Shamli",
  "Shamsabad, Agra",
  "Shamsabad, Farrukhabad",
  "Shegaon",
  "Sheikhpura",
  "Shendurjana",
  "Shenkottai",
  "Sheoganj",
  "Sheohar",
  "Sheopur",
  "Sherghati",
  "Sherkot",
  "Shiggaon",
  "Shikaripur",
  "Shikarpur, Bulandshahr",
  "Shikohabad",
  "Shillong",
  "Shimla",
  "Shirdi",
  "Shirpur-Warwade",
  "Shirur",
  "Shishgarh",
  "Shivamogga",
  "Shivpuri",
  "Sholavandan",
  "Sholingur",
  "Shoranur",
  "Shrigonda",
  "Shrirampur",
  "Shrirangapattana",
  "Shujalpur",
  "Siana",
  "Sibsagar",
  "Siddipet",
  "Sidhi",
  "Sidhpur",
  "Sidlaghatta",
  "Sihor",
  "Sihora",
  "Sikanderpur",
  "Sikandra Rao",
  "Sikandrabad",
  "Sikar",
  "Silao",
  "Silapathar",
  "Silchar",
  "Siliguri",
  "Sillod",
  "Silvassa",
  "Simdega",
  "Sindagi",
  "Sindhagi",
  "Sindhnur",
  "Singrauli",
  "Sinnar",
  "Sira",
  "Sircilla",
  "Sirhind Fatehgarh Sahib",
  "Sirkali",
  "Sirohi",
  "Sironj",
  "Sirsa",
  "Sirsaganj",
  "Sirsi",
  "Sirsi",
  "Siruguppa",
  "Sitamarhi",
  "Sitapur",
  "Sitarganj",
  "Sivaganga",
  "Sivagiri",
  "Sivakasi",
  "Siwan",
  "Sohagpur",
  "Sohna",
  "Sojat",
  "Solan",
  "Solapur",
  "Sonamukhi",
  "Sonepur",
  "Songadh",
  "Sonipat",
  "Sopore",
  "Soro",
  "Soron",
  "Soyagaon",
  "Sri Madhopur",
  "Srikakulam",
  "Srikalahasti",
  "Srinagar",
  "Srinagar",
  "Srinivaspur",
  "Srirampore",
  "Srisailam Project (Right Flank Colony) Township",
  "Srivilliputhur",
  "Sugauli",
  "Sujangarh",
  "Sujanpur",
  "Sullurpeta",
  "Sultanganj",
  "Sultanpur",
  "Sumerpur",
  "Sumerpur",
  "Sunabeda",
  "Sunam",
  "Sundargarh",
  "Sundarnagar",
  "Supaul",
  "Surandai",
  "Surapura",
  "Surat",
  "Suratgarh",
  "SUrban Agglomerationr",
  "Suri",
  "Suriyampalayam",
  "Suryapet",
  "Tadepalligudem",
  "Tadpatri",
  "Takhatgarh",
  "Taki",
  "Talaja",
  "Talcher",
  "Talegaon Dabhade",
  "Talikota",
  "Taliparamba",
  "Talode",
  "Talwara",
  "Tamluk",
  "Tanda",
  "Tandur",
  "Tanuku",
  "Tarakeswar",
  "Tarana",
  "Taranagar",
  "Taraori",
  "Tarbha",
  "Tarikere",
  "Tarn Taran",
  "Tasgaon",
  "Tehri",
  "Tekkalakote",
  "Tenali",
  "Tenkasi",
  "Tenu dam-cum-Kathhara",
  "Terdal",
  "Tezpur",
  "Thakurdwara",
  "Thammampatti",
  "Thana Bhawan",
  "Thane",
  "Thanesar",
  "Thangadh",
  "Thanjavur",
  "Tharad",
  "Tharamangalam",
  "Tharangambadi",
  "Theni Allinagaram",
  "Thirumangalam",
  "Thirupuvanam",
  "Thiruthuraipoondi",
  "Thiruvalla",
  "Thiruvallur",
  "Thiruvananthapuram",
  "Thiruvarur",
  "Thodupuzha",
  "Thoubal",
  "Thrissur",
  "Thuraiyur",
  "Tikamgarh",
  "Tilda Newra",
  "Tilhar",
  "Tindivanam",
  "Tinsukia",
  "Tiptur",
  "Tirora",
  "Tiruchendur",
  "Tiruchengode",
  "Tiruchirappalli",
  "Tirukalukundram",
  "Tirukkoyilur",
  "Tirunelveli",
  "Tirupathur",
  "Tirupathur",
  "Tirupati",
  "Tiruppur",
  "Tirur",
  "Tiruttani",
  "Tiruvannamalai",
  "Tiruvethipuram",
  "Tiruvuru",
  "Tirwaganj",
  "Titlagarh",
  "Tittakudi",
  "Todabhim",
  "Todaraisingh",
  "Tohana",
  "Tonk",
  "Tuensang",
  "Tuljapur",
  "Tulsipur",
  "Tumkur",
  "Tumsar",
  "Tundla",
  "Tuni",
  "Tura",
  "Uchgaon",
  "Udaipur",
  "Udaipur",
  "Udaipurwati",
  "Udgir",
  "Udhagamandalam",
  "Udhampur",
  "Udumalaipettai",
  "Udupi",
  "Ujhani",
  "Ujjain",
  "Umarga",
  "Umaria",
  "Umarkhed",
  "Umbergaon",
  "Umred",
  "Umreth",
  "Una",
  "Unjha",
  "Unnamalaikadai",
  "Unnao",
  "Upleta",
  "Uran Islampur",
  "Uran",
  "Uravakonda",
  "Urmar Tanda",
  "Usilampatti",
  "Uthamapalayam",
  "Uthiramerur",
  "Utraula",
  "Vadakkuvalliyur",
  "Vadalur",
  "Vadgaon Kasba",
  "Vadipatti",
  "Vadnagar",
  "Vadodara",
  "Vaijapur",
  "Vaikom",
  "Valparai",
  "Valsad",
  "Vandavasi",
  "Vaniyambadi",
  "Vapi",
  "Vapi",
  "Varanasi",
  "Varkala",
  "Vasai-Virar",
  "Vatakara",
  "Vedaranyam",
  "Vellakoil",
  "Vellore",
  "Venkatagiri",
  "Veraval",
  "Vidisha",
  "Vijainagar, Ajmer",
  "Vijapur",
  "Vijayapura",
  "Vijayawada",
  "Vijaypur",
  "Vikarabad",
  "Vikramasingapuram",
  "Viluppuram",
  "Vinukonda",
  "Viramgam",
  "Virudhachalam",
  "Virudhunagar",
  "Visakhapatnam",
  "Visnagar",
  "Viswanatham",
  "Vita",
  "Vizianagaram",
  "Vrindavan",
  "Vyara",
  "Wadgaon Road",
  "Wadhwan",
  "Wadi",
  "Wai",
  "Wanaparthy",
  "Wani",
  "Wankaner",
  "Wara Seoni",
  "Warangal",
  "Wardha",
  "Warhapur",
  "Warisaliganj",
  "Warora",
  "Warud",
  "Washim",
  "Wokha",
  "Yadgir",
  "Yamunanagar",
  "Yanam",
  "Yavatmal",
  "Yawal",
  "Yellandu",
  "Yemmiganur",
  "Yerraguntla",
  "Yevla",
  "Zaidpur",
  "Zamania",
  "Zira",
  "Zirakpur",
  "Zunheboto",
];

const WEDDING_EVENTS = [
  { id: "carnival", dayGroup: "24", title: "Carnival", time: "Morning" },
  {
    id: "sur_sandhya",
    dayGroup: "24",
    title: "Sur Sandhya",
    time: "Evening",
  },
  { id: "wedding", dayGroup: "25", title: "The Wedding", time: "Evening" },
  { id: "reception", dayGroup: "25", title: "The Reception", time: "Night" },
] as const;

const ALL_EVENT_IDS = ["carnival", "sur_sandhya", "wedding", "reception"];

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(120),
  mobile: z
    .string()
    .trim()
    .min(6, "Please enter your contact number")
    .max(20, "Number is too long")
    .regex(/^[0-9+\-\s()]*$/, "Only digits and + - ( ) are allowed"),
  attendance: z.enum(["yes", "some", "unsure", "no"]).default("yes"),
  adults: z.coerce.number().int().min(1).max(50).default(2),
  children: z.coerce.number().int().min(0).max(50).default(0),
  travelMode: z.string().trim().default(""),
  travelCity: z.string().trim().default(""),
  arrivalDate: z.string().trim().default(""),
  arrivalTime: z.string().trim().default(""),
  message: z.string().trim().max(1000).default(""),
});

type FormValues = z.input<typeof formSchema>;
type Saved = {
  id: string;
  values: z.output<typeof formSchema>;
  attendingDays?: string;
};

const EASE = [0.22, 0.61, 0.24, 1] as const;

const ATTENDANCE_CHOICES = [
  { value: "yes" as const, label: "Attending Joyfully" },
  { value: "some" as const, label: "Some of Us" },
  { value: "unsure" as const, label: "Still Deciding" },
  { value: "no" as const, label: "Regretfully Decline" },
];

const TRAVEL_MODE_CHOICES = [
  { value: "Car", label: "Car", icon: Car },
  { value: "Flight", label: "Flight", icon: Plane },
  { value: "Train", label: "Train", icon: Train },
  { value: "Bus", label: "Bus", icon: Bus },
  { value: "Other", label: "Other", icon: MapPin },
] as const;

const labelClass =
  "block text-[0.66rem] uppercase tracking-[0.2em] text-gold-deep font-semibold mb-2";
const fieldClass =
  "w-full rounded-xl border border-gold/40 bg-ivory/90 px-3.5 py-3 font-sans text-[0.88rem] text-charcoal outline-none transition-all placeholder:text-warmgrey/50 shadow-sm focus:border-gold focus:bg-ivory focus:ring-2 focus:ring-gold/25";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1 text-[0.7rem] text-destructive">{message}</p>;
}

function formatEventsDisplay(raw?: string) {
  if (!raw || raw === "all" || raw === "both") return "All Celebrations";
  if (raw === "24") return "Day 1 (Carnival & Sur Sandhya)";
  if (raw === "25") return "Day 2 (Wedding & Reception)";

  const parts: string[] = [];
  if (raw.includes("carnival")) parts.push("Carnival");
  if (raw.includes("sur_sandhya")) parts.push("Sur Sandhya");
  if (raw.includes("wedding")) parts.push("Wedding");
  if (raw.includes("reception")) parts.push("Reception");

  return parts.length > 0 ? parts.join(", ") : "All Celebrations";
}

export function RsvpSection() {
  const submit = useServerFn(submitRsvp);
  const update = useServerFn(updateRsvp);
  const checkExists = useServerFn(checkRsvpExists);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [editing, setEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(ALL_EVENT_IDS);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      attendance: "yes",
      adults: 2,
      children: 0,
      travelMode: "",
      travelCity: "",
      arrivalDate: "",
      arrivalTime: "",
      message: "",
    },
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Saved;
      if (parsed?.id) {
        setSaved(parsed);
        if (parsed.attendingDays) {
          if (
            parsed.attendingDays === "all" ||
            parsed.attendingDays === "both"
          ) {
            setSelectedEvents(ALL_EVENT_IDS);
          } else if (parsed.attendingDays === "24") {
            setSelectedEvents(["carnival", "sur_sandhya"]);
          } else if (parsed.attendingDays === "25") {
            setSelectedEvents(["wedding", "reception"]);
          } else {
            const evs = parsed.attendingDays
              .split(",")
              .map((s) => s.trim())
              .filter((id) => ALL_EVENT_IDS.includes(id));
            if (evs.length > 0) setSelectedEvents(evs);
          }
        }
        checkExists({ data: { id: parsed.id } })
          .then((res) => {
            if (!res?.exists) {
              localStorage.removeItem(STORAGE_KEY);
              setSaved(null);
            }
          })
          .catch(() => {});
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [checkExists]);

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const attendance = watch("attendance");
  const adultsCount = watch("adults");
  const childrenCount = watch("children");
  const travelMode = watch("travelMode");
  const travelCity = watch("travelCity") || "";

  // Dynamic suggestions: Only show while typing (no static chips when empty)
  const matchingCities = useMemo(() => {
    const query = travelCity.trim().toLowerCase();
    if (!query) return [];
    return POPULAR_CITIES.filter(
      (c) => c.toLowerCase().includes(query) && c.toLowerCase() !== query,
    ).slice(0, 6);
  }, [travelCity]);

  function toggleEvent(id: string) {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function resetForm() {
    localStorage.removeItem(STORAGE_KEY);
    setSaved(null);
    setEditing(false);
    setSelectedEvents(ALL_EVENT_IDS);
    reset({
      fullName: "",
      mobile: "",
      attendance: "yes",
      adults: 2,
      children: 0,
      travelMode: "",
      travelCity: "",
      arrivalDate: "",
      arrivalTime: "",
      message: "",
    });
  }

  const onSubmit = handleSubmit(async (raw) => {
    setServerError(null);
    const parsed = formSchema.parse(raw);
    const attendingDays =
      selectedEvents.length === 4
        ? "all"
        : selectedEvents.length === 0
          ? "none"
          : selectedEvents.join(",");

    const payload = {
      ...parsed,
      attendingDays,
    };

    try {
      const result =
        editing && saved
          ? await update({ data: { ...payload, id: saved.id } })
          : await submit({ data: payload });
      const record: Saved = {
        id: result.id,
        values: parsed,
        attendingDays,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setSaved(record);
      setEditing(false);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  });

  function startEdit() {
    if (!saved) return;
    reset({ ...saved.values });
    if (saved.attendingDays) {
      if (saved.attendingDays === "all" || saved.attendingDays === "both") {
        setSelectedEvents(ALL_EVENT_IDS);
      } else if (saved.attendingDays === "24") {
        setSelectedEvents(["carnival", "sur_sandhya"]);
      } else if (saved.attendingDays === "25") {
        setSelectedEvents(["wedding", "reception"]);
      } else {
        const evs = saved.attendingDays
          .split(",")
          .map((s) => s.trim())
          .filter((id) => ALL_EVENT_IDS.includes(id));
        if (evs.length > 0) setSelectedEvents(evs);
      }
    }
    setEditing(true);
  }

  const showSuccess = saved && !editing;
  const isAttendingOrSome = attendance === "yes" || attendance === "some";

  return (
    <section id="rsvp" className="canvas relative pb-20 sm:pb-28">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex flex-col items-center text-center"
      >
        <span className="eyebrow tracking-royal mb-1 text-gold-deep">
          Join Us
        </span>
        <h2 className="font-creative text-2xl sm:text-3xl font-bold tracking-widest text-burgundy uppercase">
          RSVP
        </h2>
        <Divider className="mt-3" />
      </motion.header>

      <AnimatePresence mode="wait" initial={false}>
        {showSuccess ? (
          <motion.article
            key="success"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="paper inner-frame grain relative mt-8 sm:mt-12 overflow-hidden px-6 py-10 sm:px-12 sm:py-14 text-center rounded-3xl shadow-lift"
          >
            <CornerFlourishes />

            <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#F7DF94] bg-[radial-gradient(circle_at_32%_32%,_#FFF4C2_0%,_#E5C158_38%,_#B88A1A_78%,_#594004_100%)] text-[#3D2700] shadow-[0_0_25px_rgba(229,193,88,0.35)]">
              {saved.values.attendance === "no" ? (
                <Heart size={20} strokeWidth={2.2} />
              ) : (
                <Check size={22} strokeWidth={2.4} />
              )}
            </div>

            {saved.values.attendance === "yes" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  We can&apos;t wait to celebrate with you! &hearts;
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  See you in Rajkot.
                </p>
              </>
            )}

            {saved.values.attendance === "some" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  Wonderful! We look forward to seeing you. &hearts;
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  Every blessing makes it memorable.
                </p>
              </>
            )}

            {saved.values.attendance === "unsure" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  Noted with warmth, {saved.values.fullName.split(" ")[0]}.
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  Let us know whenever you are ready.
                </p>
              </>
            )}

            {saved.values.attendance === "no" && (
              <>
                <h3 className="font-creative mt-5 text-2xl sm:text-3xl font-semibold text-burgundy">
                  You will be dearly missed,{" "}
                  {saved.values.fullName.split(" ")[0]}.
                </h3>
                <p className="font-display italic text-sm sm:text-base text-gold-deep mt-1.5">
                  Sending you our warmest love.
                </p>
              </>
            )}

            <Divider className="my-6" />

            {(saved.values.attendance === "yes" ||
              saved.values.attendance === "some") && (
              <div className="hairline-gold mx-auto max-w-sm rounded-xl bg-ivory/80 overflow-hidden shadow-sm text-left">
                <dl className="divide-y divide-gold/20 text-[0.84rem]">
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-gold-deep font-semibold">
                      Guest
                    </dt>
                    <dd className="font-serif text-burgundy font-medium">
                      {saved.values.fullName}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-gold-deep font-semibold">
                      Events
                    </dt>
                    <dd className="font-serif text-burgundy text-right font-medium">
                      {formatEventsDisplay(saved.attendingDays)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-gold-deep font-semibold">
                      Count
                    </dt>
                    <dd className="font-serif text-burgundy font-medium">
                      {saved.values.adults} Adults
                      {(saved.values.children ?? 0) > 0
                        ? `, ${saved.values.children} Children`
                        : ""}
                    </dd>
                  </div>
                  {(saved.values.travelMode ||
                    saved.values.travelCity ||
                    saved.values.arrivalDate) && (
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-gold-deep font-semibold">
                        Arrival
                      </dt>
                      <dd className="font-serif text-burgundy text-right text-xs">
                        {saved.values.travelMode && (
                          <span className="font-medium">
                            {saved.values.travelMode}
                          </span>
                        )}
                        {saved.values.travelCity &&
                          ` from ${saved.values.travelCity}`}
                        {saved.values.arrivalDate &&
                          ` · ${saved.values.arrivalDate}`}
                        {saved.values.arrivalTime &&
                          ` at ${saved.values.arrivalTime}`}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={startEdit}
                className="btn-3d-secondary w-full sm:w-auto !px-6 !py-3 text-[0.65rem] tracking-[0.2em] whitespace-nowrap cursor-pointer"
              >
                Edit Response
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-block text-[0.62rem] uppercase tracking-[0.2em] text-warmgrey hover:text-burgundy transition-colors underline underline-offset-4 cursor-pointer whitespace-nowrap py-2"
              >
                Submit Another
              </button>
            </div>
          </motion.article>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="paper inner-frame grain relative mt-8 sm:mt-12 space-y-7 px-5 py-8 sm:px-10 sm:py-10 rounded-3xl shadow-lift border border-gold/45"
          >
            <CornerFlourishes />

            {/* Attendance Choice */}
            <div>
              <label className={`${labelClass} text-center block mb-2.5`}>
                Will you be attending?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {ATTENDANCE_CHOICES.map((choice) => {
                  const selected = attendance === choice.value;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => setValue("attendance", choice.value)}
                      className={`relative cursor-pointer rounded-2xl p-3.5 text-center transition-all duration-200 border flex items-center justify-center min-h-[50px] ${
                        selected
                          ? "border-[#E5C158] bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17] text-ivory shadow-md"
                          : "border-gold/40 bg-ivory/80 text-charcoal hover:border-gold hover:bg-ivory"
                      }`}
                    >
                      <span className="font-serif text-sm sm:text-base font-medium leading-snug">
                        {choice.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Details (Mandatory) */}
            <div className="space-y-4 pt-1">
              <div>
                <label className={labelClass} htmlFor="fullName">
                  Your Name *
                </label>
                <input
                  id="fullName"
                  className={fieldClass}
                  placeholder="Full name"
                  autoComplete="name"
                  {...register("fullName")}
                />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div>
                <label className={labelClass} htmlFor="mobile">
                  Contact Number *
                </label>
                <input
                  id="mobile"
                  type="tel"
                  className={fieldClass}
                  placeholder="Mobile number"
                  autoComplete="tel"
                  {...register("mobile")}
                />
                <FieldError message={errors.mobile?.message} />
              </div>
            </div>

            {/* Eventwise & Logistics Sections (Optional with Defaults) */}
            {isAttendingOrSome && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="space-y-6 pt-1"
              >
                {/* Eventwise Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>Events Attending</label>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedEvents(
                          selectedEvents.length === 4 ? [] : [...ALL_EVENT_IDS],
                        )
                      }
                      className="text-[0.62rem] uppercase tracking-[0.14em] font-medium text-gold-deep hover:text-burgundy transition-colors cursor-pointer"
                    >
                      {selectedEvents.length === 4 ? "Clear All" : "Select All"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Day 1 */}
                    <div className="rounded-xl border border-gold/30 bg-ivory/60 p-3">
                      <p className="text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey mb-2">
                        Day 1 · Wednesday, 24 Feb
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {WEDDING_EVENTS.slice(0, 2).map((ev) => {
                          const isSelected = selectedEvents.includes(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => toggleEvent(ev.id)}
                              className={`cursor-pointer rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 border flex items-center justify-between min-h-[52px] ${
                                isSelected
                                  ? "border-[#E5C158] bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17] text-ivory shadow-sm"
                                  : "border-gold/30 bg-ivory text-charcoal hover:border-gold/60"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-serif text-[0.92rem] font-medium leading-snug">
                                  {ev.title}
                                </p>
                                <p
                                  className={`text-[0.68rem] leading-none mt-1 ${
                                    isSelected
                                      ? "text-gold-light"
                                      : "text-warmgrey"
                                  }`}
                                >
                                  {ev.time}
                                </p>
                              </div>
                              <div
                                className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-gold bg-[#E5C158] text-[#3D2700]"
                                    : "border-gold/40 bg-ivory"
                                }`}
                              >
                                {isSelected && (
                                  <Check size={12} strokeWidth={2.6} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Day 2 */}
                    <div className="rounded-xl border border-gold/30 bg-ivory/60 p-3">
                      <p className="text-[0.62rem] uppercase tracking-[0.16em] font-semibold text-warmgrey mb-2">
                        Day 2 · Thursday, 25 Feb
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {WEDDING_EVENTS.slice(2, 4).map((ev) => {
                          const isSelected = selectedEvents.includes(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={() => toggleEvent(ev.id)}
                              className={`cursor-pointer rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 border flex items-center justify-between min-h-[52px] ${
                                isSelected
                                  ? "border-[#E5C158] bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17] text-ivory shadow-sm"
                                  : "border-gold/30 bg-ivory text-charcoal hover:border-gold/60"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-serif text-[0.92rem] font-medium leading-snug">
                                  {ev.title}
                                </p>
                                <p
                                  className={`text-[0.68rem] leading-none mt-1 ${
                                    isSelected
                                      ? "text-gold-light"
                                      : "text-warmgrey"
                                  }`}
                                >
                                  {ev.time}
                                </p>
                              </div>
                              <div
                                className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-gold bg-[#E5C158] text-[#3D2700]"
                                    : "border-gold/40 bg-ivory"
                                }`}
                              >
                                {isSelected && (
                                  <Check size={12} strokeWidth={2.6} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Number of Attendees */}
                <div>
                  <label className={labelClass}>Number of Guests</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-ivory/90 px-3 py-2.5 shadow-sm">
                      <span className="text-xs text-charcoal font-medium">
                        Adults
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              "adults",
                              Math.max(1, (adultsCount || 1) - 1),
                            )
                          }
                          className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="w-5 text-center font-serif text-base font-medium text-burgundy">
                          {adultsCount || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              "adults",
                              Math.min(20, (adultsCount || 1) + 1),
                            )
                          }
                          className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-ivory/90 px-3 py-2.5 shadow-sm">
                      <span className="text-xs text-charcoal font-medium">
                        Children
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              "children",
                              Math.max(0, (childrenCount || 0) - 1),
                            )
                          }
                          className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="w-5 text-center font-serif text-base font-medium text-burgundy">
                          {childrenCount || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              "children",
                              Math.min(10, (childrenCount || 0) + 1),
                            )
                          }
                          className="h-7 w-7 rounded-lg border border-gold/40 bg-ivory text-burgundy font-semibold text-sm flex items-center justify-center hover:bg-gold/15 active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How Will Guest Arrive */}
                <div>
                  <label className={labelClass}>How Will You Arrive?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {TRAVEL_MODE_CHOICES.map((choice) => {
                      const Icon = choice.icon;
                      const isSelected = travelMode === choice.value;
                      return (
                        <button
                          key={choice.value}
                          type="button"
                          onClick={() =>
                            setValue(
                              "travelMode",
                              isSelected ? "" : choice.value,
                            )
                          }
                          className={`cursor-pointer rounded-xl py-2.5 px-1 text-center transition-all duration-200 border flex flex-col items-center justify-center gap-1.5 min-h-[58px] ${
                            isSelected
                              ? "border-[#E5C158] bg-gradient-to-r from-[#8B1A2D] via-[#671224] to-[#480A17] text-ivory shadow-sm"
                              : "border-gold/35 bg-ivory/80 text-charcoal hover:border-gold"
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              isSelected ? "text-gold-light" : "text-gold-deep"
                            }
                          />
                          <span className="font-serif text-xs font-medium leading-none">
                            {choice.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Travelling From (City) with real-time suggestions while typing */}
                <div className="relative">
                  <label className={labelClass} htmlFor="travelCity">
                    Travelling From (City)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-deep">
                      <MapPin size={15} />
                    </div>
                    <input
                      id="travelCity"
                      autoComplete="off"
                      placeholder="Type city name (e.g. Ahmedabad)"
                      className={`${fieldClass} pl-10`}
                      {...register("travelCity")}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => setShowCitySuggestions(false), 200);
                      }}
                    />
                  </div>

                  {/* Suggestion list appears strictly while typing */}
                  {showCitySuggestions && matchingCities.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gold/40 bg-ivory shadow-lg divide-y divide-gold/15">
                      {matchingCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setValue("travelCity", city, {
                              shouldValidate: true,
                            });
                            setShowCitySuggestions(false);
                          }}
                          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs sm:text-sm text-charcoal hover:bg-gold/15 hover:text-burgundy transition-colors cursor-pointer"
                        >
                          <span className="font-medium">{city}</span>
                          <span className="text-[0.62rem] text-gold-deep uppercase tracking-wider">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrival Date (Calendar) & Time (Clock) - Fully mobile responsive without WebKit overflow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full min-w-0 max-w-full">
                  <div className="w-full min-w-0 max-w-full">
                    <label className={labelClass} htmlFor="arrivalDate">
                      Arrival Date
                    </label>
                    <div className="relative w-full min-w-0 max-w-full">
                      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-deep z-10">
                        <Calendar size={15} />
                      </div>
                      <input
                        type="date"
                        id="arrivalDate"
                        min="2027-02-20"
                        max="2027-02-28"
                        style={{
                          WebkitAppearance: "none",
                          minWidth: 0,
                          maxWidth: "100%",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        className={`${fieldClass} pl-10 block box-border min-w-0 max-w-full cursor-pointer [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:overflow-hidden [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
                        {...register("arrivalDate")}
                      />
                    </div>
                  </div>

                  <div className="w-full min-w-0 max-w-full">
                    <label className={labelClass} htmlFor="arrivalTime">
                      Arrival Time
                    </label>
                    <div className="relative w-full min-w-0 max-w-full">
                      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-deep z-10">
                        <Clock size={15} />
                      </div>
                      <input
                        type="time"
                        id="arrivalTime"
                        style={{
                          WebkitAppearance: "none",
                          minWidth: 0,
                          maxWidth: "100%",
                          width: "100%",
                          boxSizing: "border-box",
                        }}
                        className={`${fieldClass} pl-10 block box-border min-w-0 max-w-full cursor-pointer [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:overflow-hidden [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
                        {...register("arrivalTime")}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wishes / Note */}
            <div>
              <label className={labelClass} htmlFor="message">
                A Note for the Couple
              </label>
              <textarea
                id="message"
                rows={3}
                className={`${fieldClass} resize-none`}
                placeholder="Wishes, blessings, or a sweet note…"
                {...register("message")}
              />
            </div>

            {serverError && (
              <p className="border border-destructive/40 bg-destructive/5 rounded-lg px-3 py-2 text-[0.75rem] text-destructive">
                {serverError}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d-primary flex w-full items-center justify-center gap-2 !py-3.5 text-[0.72rem] tracking-[0.22em] whitespace-nowrap cursor-pointer disabled:cursor-default"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 whitespace-nowrap">
                      {editing
                        ? "Update RSVP"
                        : attendance === "yes"
                          ? "Confirm RSVP"
                          : attendance === "some"
                            ? "Confirm Attendance"
                            : attendance === "unsure"
                              ? "Keep Me Posted"
                              : "Send Wishes"}
                    </span>
                    <ArrowRight size={14} strokeWidth={2} />
                  </>
                )}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="mt-3 w-full text-center text-[0.62rem] uppercase tracking-[0.2em] text-warmgrey hover:text-burgundy cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
