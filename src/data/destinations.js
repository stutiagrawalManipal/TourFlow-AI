/**
 * TourFlow AI - Realistic Indian Heritage & Tourism Mock Dataset
 * Contains live crowd indicators, queue capacity, coordinates, and rich cultural profiles.
 */

export const DESTINATIONS = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    location: "Agra, Uttar Pradesh",
    state: "Uttar Pradesh",
    coordinates: "27.1751° N, 78.0421° E",
    category: "Historical",
    crowdLevel: "HIGH",
    crowdPercent: 88,
    estimatedWait: "35 min",
    currentQueue: 42,
    queueCapacity: 80,
    currentTicketNumber: 138,
    visitorCountToday: 4890,
    rating: 4.9,
    reviewsCount: 1420,
    visitingHours: "06:00 AM - 06:30 PM (Closed on Fridays)",
    entryFee: "₹50 (Indian) / ₹1100 (Foreign)",
    bestTime: "Sunrise (06:00 AM) or Late Afternoon (04:00 PM)",
    imageUrl:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "17th-century ivory-white marble mausoleum on the south bank of the Yamuna river, an eternal symbol of love.",
    fullDescription:
      "Commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal. The Taj Mahal is recognized worldwide as a masterpiece of Mughal architecture, blending Indian, Persian, and Islamic artistic traditions.",
    historicalInfo:
      "Constructed between 1632 and 1653 with the collaborative work of over 20,000 artisans across Asia, directed by a council of architects led by Ustad Ahmad Lahori. The central dome rises 73 metres and is surrounded by four decorative minarets.",
    highlights: [
      "Central Mausoleum & Marble Cenotaphs",
      "Charbagh Persian Formal Gardens",
      "Intricate Pietra Dura Inlay Stonework",
      "Mosque and Jawab Sandstone Buildings",
    ],
    recommendedVisitDuration: "2.5 - 3 hours",
  },
  {
    id: "amer-fort",
    name: "Amer Fort & Palace",
    location: "Jaipur, Rajasthan",
    state: "Rajasthan",
    coordinates: "26.9855° N, 75.8513° E",
    category: "Historical",
    crowdLevel: "MODERATE",
    crowdPercent: 58,
    estimatedWait: "18 min",
    currentQueue: 24,
    queueCapacity: 75,
    currentTicketNumber: 94,
    visitorCountToday: 2650,
    rating: 4.8,
    reviewsCount: 980,
    visitingHours: "08:00 AM - 05:30 PM & 06:30 PM - 09:15 PM (Night Tour)",
    entryFee: "₹100 (Indian) / ₹500 (Foreign)",
    bestTime: "Morning (08:30 AM) to avoid midday desert heat",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Majestic hilltop fortress in pink and yellow sandstone overlooking the serene Maota Lake.",
    fullDescription:
      "Amer Fort is renowned for its artistic Hindu style elements. Built by Raja Man Singh I in the late 16th century, its massive ramparts, series of gates and cobbled paths look down on Maota Lake, the main water source for the palace.",
    historicalInfo:
      "Constructed primarily in 1592 by Raja Man Singh I and expanded by Mirza Raja Jai Singh. It served as the main seat of the Kachwaha Rajputs until the capital was shifted to the planned city of Jaipur in 1727.",
    highlights: [
      "Sheesh Mahal (Palace of Mirrors)",
      "Diwan-e-Aam (Hall of Public Audience)",
      "Sukh Niwas with ancient air cooling channels",
      "Panoramic ramparts overlooking Maota Lake",
    ],
    recommendedVisitDuration: "2 - 3 hours",
  },
  {
    id: "gateway-of-india",
    name: "Gateway of India",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    coordinates: "18.9220° N, 72.8347° E",
    category: "Cultural",
    crowdLevel: "HIGH",
    crowdPercent: 82,
    estimatedWait: "25 min",
    currentQueue: 38,
    queueCapacity: 90,
    currentTicketNumber: 212,
    visitorCountToday: 5120,
    rating: 4.7,
    reviewsCount: 1850,
    visitingHours: "Open 24 hours (Security queue 07:00 AM - 10:00 PM)",
    entryFee: "Free (Boat rides to Elephanta extra)",
    bestTime: "Sunset (05:30 PM - 07:00 PM) for Arabian Sea breeze",
    imageUrl:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Arch monument built in Indo-Saracenic style overlooking Mumbai Harbor and the Arabian Sea.",
    fullDescription:
      "Erected to commemorate the landing of King George V and Queen Mary at Apollo Bunder on their visit to India in 1911. Today it stands as Mumbai’s most iconic gathering point and gateway to heritage boat ferries.",
    historicalInfo:
      "Designed by Scottish architect George Wittet, the yellow basalt basalt arch was completed in 1924. It later became the ceremonial departure gate for the last British troops leaving India in February 1948.",
    highlights: [
      "Indo-Saracenic Central Archway",
      "Arabian Sea Waterfront Promenade",
      "Elephanta Island Ferry Boarding Point",
      "View of the historic Taj Mahal Palace Hotel",
    ],
    recommendedVisitDuration: "1 - 1.5 hours",
  },
  {
    id: "charminar",
    name: "Charminar",
    location: "Hyderabad, Telangana",
    state: "Telangana",
    coordinates: "17.3616° N, 78.4747° E",
    category: "Cultural",
    crowdLevel: "MODERATE",
    crowdPercent: 62,
    estimatedWait: "15 min",
    currentQueue: 19,
    queueCapacity: 60,
    currentTicketNumber: 77,
    visitorCountToday: 3200,
    rating: 4.6,
    reviewsCount: 890,
    visitingHours: "09:30 AM - 05:30 PM Daily",
    entryFee: "₹25 (Indian) / ₹300 (Foreign)",
    bestTime: "Late afternoon followed by night lighting & Laad Bazaar",
    imageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Charminar_Hyderabad_1.jpg/960px-Charminar_Hyderabad_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20100404222130",
    shortDescription:
      "Square monument and mosque with four 48.7-metre ornate minarets in the heart of old Hyderabad.",
    fullDescription:
      "Constructed in 1591 by Muhammad Quli Qutb Shah to celebrate the end of a deadly plague. Charminar is the undisputed global symbol of Hyderabad, situated at the crossroads of bustling historic trade bazaars.",
    historicalInfo:
      "The structure is made of granite, limestone, mortar, and pulverized marble. Each minaret has four storeys, marked by a carved ring around each tier. The upper floor contains the oldest surviving mosque in the city.",
    highlights: [
      "Upper Balcony Mosque with 45 prayer spaces",
      "Intricate Stucco Islamic Floral Arabesques",
      "Laad Bazaar traditional lacquer bangle street",
      "Historic Mecca Masjid adjacent view",
    ],
    recommendedVisitDuration: "1.5 - 2 hours",
  },
  {
    id: "konark-sun-temple",
    name: "Konark Sun Temple",
    location: "Konark, Odisha",
    state: "Odisha",
    coordinates: "19.8876° N, 86.0945° E",
    category: "Historical",
    crowdLevel: "LOW",
    crowdPercent: 28,
    estimatedWait: "6 min",
    currentQueue: 7,
    queueCapacity: 70,
    currentTicketNumber: 42,
    visitorCountToday: 1420,
    rating: 4.8,
    reviewsCount: 650,
    visitingHours: "06:00 AM - 08:00 PM Daily",
    entryFee: "₹40 (Indian) / ₹600 (Foreign)",
    bestTime: "Early morning (06:30 AM) to catch solar rays on stone wheels",
    imageUrl:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QBoRXhpZgAASUkqAAgAAAACADEBAgAHAAAAJgAAAGmHBAABAAAALgAAAAAAAABQaWNhc2EAAAIAAJAHAAQAAAAwMjIwA5ACABQAAABMAAAAAAAAADIwMjM6MTI6MTEgMTM6NTY6NDcA/9sAhAAgFhgnIyArKCYoMC4rMjtHQDs4NzpWSkVGSmhab2xmZmVid4SskHR9on9iZZXOlqKyuMLFwnCO1ubUvOSsvsK6ASIkJDErMV81NV26fWV4urq6urq6urq6urq6urq6urq6vbq6urq6urq9urq6urq6urq6urq9vbq6urq9vbq9vbr/wAARCAE4AUYDAREAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAORAAAgIBAgQEBAQFAwQDAAAAAAECESEDMQQSQVEiYXGBE5Gh8DKxwdEFFELh8SNSYjNygpJTwuL/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/EAB4RAQEBAAMBAQADAAAAAAAAAAABEQIhMRJBE1Fh/9oADAMBAAIRAxEAPwD1nocACAAIBAAEAFRAoEQABAIAAhQAgEAAQABAAEAAAIBQIAAoAAAAFAAAAAe4woBAAEAgAAEQqgECIAAgACFACAQABAAEAAQAAAgAAAAFAAAIBQAAAAAD3GFAIAAgACACiAAIEAIBAAAogEAAQABAgBABVQAAAgACgAAAAAAAAAQAAe0w0AQABAAEAFEAAQIAQABABRAIAAgAIgACFAKAQAAAAAAAAAAAAgFAgAA9phoAgEAAAIAAhQABEAAQCACiAQAAAgRAAAAUQKAQAAAAAAAAACAAAAAAe0w0AQCAAAEKAECAUCIAAgEAFEYEAAAIEAIUAAVAAAAAAAAAAIgFAAQAAAoHtObSFACAQABCgAAgAIAQCAAIUQCAAgAAgEKBFCoAQAAABQAEAAAAAAAAAAD2nNpCgBAIAAFEAAQAEAIBABRAIACAEAAAIUQKBAAAAAAIAAAAAAAAAAAAHtObQUQABAIAKIAAgQAAQCACgBAIACAEAFUAgAIgAAAAAAAACAUAAAAQABQPYc2gogACAAIUAIEQAAAgACFACAAIEAAEKoAAgQAAAAEAAAAAAAAAAAAAB7DDQAAgACAQoAQIAQAAAgAogACAAARABRAAAABAAAABAAAABQAAAAAAAPYYaQABAAEAFECIAAAQABCgAAgACAAgBABQAgAAAAgAAAAAAAFAAAAAAB6zDQQQoAQABCiBACAAAEKAACAAAECIAAACiAAIAAAAAAAAAAAAAAAAAAPWc2wqAEAAQAUQIgACAABRAAAABAiAABRAAAIgAAACgAAAAAAAAAAAAAAHqObYAKgBAAEAFECIAAgAoBECgACBAABABQCIAAAAAAAFAAAAAAAAAAAAA9RzbAIAKiAAAEAFRAIAKIAABACAAIAAFAIgAABAAAABQoAAEAAAKBAKBBAAHqMNgACAABUQCAABUQABAAEKAQAAQABCotEtxZNZco1fMq9TH8nFv+OiaatG5ZfGLLPQqAAAACqQAAAAAAAQAAAAAPSYbAAEAAAAEKgBABUQAAAgAABAgUACQHm4mSb5W1Sjfve+H2PNz5bXp4ccjhOOioRv8Fvpm6735mG00dbR05+Fzp4r9etv5HThy+b258+Ox71TVrKPTLrz5hQQABSiCgAAACAAAAAAAAAPQYbAAAABAAAIhQAAQAVAABKAAQAEKA8evxUZJxjdPdr+pXmjjy571Hfjwx53qaTakv8Adavt6X9+ZydGdXXjhRSdW6V77LpeMAcXq80nJvCdrw0m6Sa+hUdI670nL4MlKLzytV69enkanKxLxlfU0dRakFJVndb0+x6OPLY8/LjlboqAAAAAgAAAAAKAAAAAD0HNtABQAgAAAABEKAEAAAAQKAABQHi4ziISjPSVN7N3STOXPnvUdePDO68CjBOksvNX08zi6usFGUUo01zYpW8davPQDpPVd+FbtqVxeUsbbdfqSLXCKcY3GEnFP+qO1/f5FRmerCKlypOT3TTSZR14fiJ6d8sL53bik8PyNceV4s8uM5Pp6c1NWvl1R348tcLxxoqAAABAAAAAAAAAEAAegw2AQIACgBAAACBAoAAIBQAEAoHm4/Ulp6acd20sb+xz58vx04cf18yXDaikv9K6p52d5/Q466429DVn/qSikm6k6yvYauL/ACiqUW3zp1GsJ47e+40w/ktNSalqpVVp4e/yGmOXE6UHT03HzinleXntv/ksStvhuimlFZpyTp0u2HZFTQ0pOTbe27q7Wzz1FqSOvDXoa/LJtwfWGI359DfC5Wec2Pp8ybpNN74Z3llcMsWiogAAFAAEAAABAAAAO5hoAFACAAgBCgAAAAAECLQUAUEeLjOL5LhBrm72sdzny5fkdOPH9r5+pxGo+X/UctnnlefI566LqOUqj4pVm1zZffbzIrE7urk665z9APfpqPMnyJZ7Wt8mVJKHIrT8E7XowPNrV4ZNRrZ312pd+5YV54TipNW3HrTq17s0ys21zRvmXfmte2QJHlprw1fzr3A1o6z05XHH360JcLNfY4fXjqxtYa3V3R348tceXHHSjTKAAAAAAAAAAAAB2ObYUAAQAAQoAAAAIgAAAk0lbdIWrIwtbT/+SPzRPqL81z4rXekrlF8vWmZ5cv6a48f7fNnxMXiM9Z/+WH9Dk6OS1YQy1O/OXXzAkdXT6aPXo3+4HPVmntDlz5sqPqwh40tlX3k5ttcn41aeboDHCO5OLSalSyij5EE1dRXukbYdJRkqxX7gZjKWfAn3tIDs4z5W/hRa3ugrfBasnqQ07UE5W66/f6lnrN8fZZ3cQAAAgABQAAAAAQDuYbAgAAAQoAAAAIAZlOMd5JerGrjD4jSW+pH5k+ovzWJcZop18RW87Mn1D5rjxfFaepDkhJNt9cUt7z6GeXLprjO3mjwrdvleE/fG1e/3hHPXRxg04aiwqhhbPFSrfyZUe1cInF8sORy2p+mTOtY8vFcN8PljdczWZted/mjUrLpGalJw0k4xz+Hxu++L8sEVwnpy05Q+Jfi2tVSpZ3+hdR9DTjs+ypmG3WKVT8yDhw0fHFt0lkqPm8RfxdWKrE5eu9HRhtvmVOP4c2kvNq/p9SNNOUOVuPJzXTi1LyXSuoRNZzdJNtcvM0oV6V5bBXONy118OaTlSVWl2LGa+7GLUUm7aWX3O7ioAAAAAAAACAAAHSTUU23SXVmGnDV4uMds/wCL/YmrjvGSez8yooAAAKAADy8ZxnwfClzSq/REtxZNeSX8R1qvlgrTp5++pn6a+Xl1fDpzficm1u9nv+5hpz1HKGmm14pSfStt1XqVFilqakaxiq3zkK6/y1NuSumlV9enXzJo6rW5sc3w+RtLCuKdpLyJiums1SajTSim2s+KMk787SCPXwq/0dJv/ZHBi+tzx4/4l4pwhm0m/n/g1x8SvToxhDdpKMVm0lv+tWRXn/iUX8TRSw05Pb0LxTk9OjHCT3SRKrfLl/f0IOEE1XSolHzm3PV1mnXO3V+cro3WI9mqk4tJ6ab5m9ld2l8v3MtM8PD/AEW5SqLblfvQvpPHbU0HDlcdS1+Fxk6x1r08yauPnfCktaCi6tqn0vH7nSOdfeZ2cgCAAKAoCNpbtL1ARaatNNeQFoDGpNQVsW4Y1aqwFBHLjp1Grceto51t8dTuabdVm/PzIr6v8Oa+HJqScU8u8bLbsjSPRHiNKVVqRt7K8/IaOjRRasDM5xhXPKMb2t0Ec58VpRV/Ei/Rp/exNXEhxmjLbUW15xgaY+V/EEpakkpKUm9v+Pl8jG9t50Rb8SjG/DnGUnX7befmRWNfVbjyTylK2rSarf8AMsKxxDjqKCi0oxi3l7uxErX8P0efnblKMFvyuvukmKR7k4qHPFNrdvq1s313MNuGlqKM21FrmjWE8W1mq8vr5lZdNflgpYdqSS7Lla/SQg9sa07pt5ttvcxbrpI+dxU5PXqGo4pzSfyinfc3PGL61w+nHVX+rlyjFvDWc5JasjHGwX8zpxivwxjSSzSz+RZ4l9emEkpK+Z9e5lpnVS8WfFnzsIzp1Lw3RR4paajruNt/7XdO6tfU1+M/r28Vpxk9Dxcqa3jjtVe5mNVx4bRuM1cla/EulV19xaSOk+HUXFqU205SbTllZ+TwNMeZSriIttuMZ3l3Sv8AsbjNfdaOrklAKAkWmrTTXdMaMT4jTim+ZOuzRPqGPncVxsptcjcYrf19TneWrI4PWnPLk21j6EV00OIlpN8qWd4tbMS2DpL+JalKuW32VmvupjnPiHOTvPll16Gdqt/zk3FPDimsr6F+qmOujxazlR733LORj53NnOF5LzIrCkndPoUdNKbgrUqvfcg9Glr6c23ONVWXlUlhfl/YuwfQX8S0qfSVXXcs5Jj5vE8bq6jcXLlXZYRndVx+FJ14W78gOk9JKMnKM2k2r2t7Lf0I3jlxcYxajF4S67+/z+hYlajp+KEbrlhfS8/5Cu2hw6cnKprxYqLyvUg8U3cpPbqaR0nrXpKNtu3npX3ZB6f4fBR0p6sm+VSqSVZXX8yUj1aus3HMUp8rcUnzedLDxV+1GWjV4WK1HytOk7hbwsrHyf3kujhqxtwilKPPKfNfmo/qgPoqdycXWyefO/2ObbycUktbScItNuTfLG3bSzRudxmu3C6ajLF0oJJtNdX0ZmrGeLiv5jRT7Tt+xqeJfRaOYeV09iK56miufKeWqddyxFhw6ST6uMnj79CDxcY+XVheaV59X+iNzxm+vrx04TjpyaWEnHy+8HOtuClHT4mOnGLqSukrV7fkkX2H67qVT5eVtYVqqWNmStR87jdPeai8qMm1XKk0l6m458jS4iUpJubUvNv7oltjDp/P6mm6mk+vma486mOy4uUlcWqeyrYl51cfOm3zZa3oImXhPbzKIs1UX82vLOWBuUHVvrtTw++SDEuVqKXh79n6FGdOSm34fqn+YHSen4XSqsPGSaMVBbS88dbKJLmWMyV9W0By32/M0JCuZXtYHVNyko0lfyRBucFGK8Sa8VeJEaxdKCblWWk6Sd48vvqKYJyUnUHzLutvYGOkY6r5ZLS2p2mk3gdLg56zltJZfKnJY+7HQ6py+I4z04/Eni21v5+vsRTllz6rS5Wo972z29CoxHVlbjBTTT6u89em+QOceGUqeY9GuuN3kumPG390Vl6eC4laVu7w3ytYbSwSxY9b4vSakoVF4SaindYX0oxjUrEJKWpzLMrUlfV3bV9N38i/gsJ7Tdcyy0k6bztW3f7pKRr+cS1fick9q/CtvW/uyYusampGep8Z4gqqL38/QsStr+KJalyi2qTVSusWT56X6NXiYznCcZW4c3dXaLJibqri5p4e+ctOiYutvV1HnDrzSII9bWaxGN5TuSLkO3n4nh56suZJWklVqlbf7llSx6eH4tRhU7aWzSvBLO1lb4niE46Ti7qa2bWKfbPUki0lJcs1dqVtYmst56dgrnqqGpGV3FtJRqM6VexYlfPg+WajNU+qayjVmxysNWfhvC7bE4wd4W4SalvXR0lldFtt97QedRbnyrxy6KKbfsbFk5KMZK0ttsX9sgsJKKd3KvICc8JNPHV5Txn6hFSfI/wyWNn715f3ArlTjtJbLNgSOk31ajbwBqL/AGw22wJOa2lFd3TvPnkYM/AdYgsyq78O3eyrjWrw6hdxeFbpvG3deZNo1/LvTklTUqUqu35dCbqydu7m21F20+nTffG1ZDbnGXxGozUX2d07fXbs0EaUYtSnFw3vP4r2X6AJKEIWlHFxzFZlXf5gYcYKSkoqUWpdElh4/boUbgo87cJLwqMVFxXieLCNcq1uXdxcs9Xh01fakFZ0dOUYykq3fT+ravr97k0xJqMI3yxrldNJZ2S3z29b+YeBmmQDWkvFXcEe6GlHEqVOn+J5Xpv2XmZ1rF+EnPdxjbVVvj/I0x6uF09PmjKcqxTi1jZp9CauMcRq/E4R3lxSt79t/qWepfHyJvP0NsNcPqcsvxUn5Eqx6tOcuZcvK17JmWnqXNVUs9pIit30fN/7xAxF82rGLlvf9W1R8h+BwfJeppS5X4nyus7lqRy0tJuclJ4ttX/3ZWPKxpIxpT1NZNpxSr5P/F/IXITt6dHQbfLLUXM1d1jySJq456abhzam+VSrOff0Kg9OUYJyVu7un+Gs7/fyAzqaMq508X0S7+vl9Rpg4vlcnqq1bUaTtL3GmHJJ6fMpxaav3pY+r+Q0xrV0+WP/AFLaVpVu/UaYsNFO1qeH16rHye40x5eLUtOc4qMaWd7LGbE0YT1IuWnFp2luq/t95F69Jxt8Y+HOcZZvk3S6fsgmOXNJO7eO5RubjLo4td6A+jPh5Ju4N8yzUL2WyZlppabbTlbh2bjWX1TQ0w4iCackoqnbblfySQna+PLHQ5ZxSalKTSTrFeTvcv4ufrrzxjqwg7mnT8KyrXd56lxnWFGDVJ1FY5qvNZWOnv0JSM6nI5OKl4U1J3GsX3u+r+fyCc/NJxTk0lbab6dt/ICaepfNPlrLlzNXnp08y0jrw8Ulzc3K6aacHX02IrDanei5O1Jcss1i7sZ+n+HEpyV8yjyqqaeb8+2whXknFRtOVtNLGVWb/QrKrQl8aOnJcrk4qnir/IGNx4XUc3GK2eObw3v39Cjtw8nOrlNqNuk399zNajrpwi9PLqUpt0+mHWSDUNGPxblKPKrXKr8+vqNVnidOPI/FzOLSTwk16fMRK+fqK5P1NsOmlwsp7Rfyf7EtxZHr+Ckqd43pf2Ma3iSbWYuumI1+gBSnvzP50BrThzTTnhK3aeduhUc9F8vFV+LxU21m7WS3wnrlqasoa03jNSwqptX+oxNcVqSUrvLKj6Olq3BN5b2pZVb+pnG2dKUrcb2naVVj7Yo2ppu48lK66Z6X/kg5eJw1FCPibdYvCePcqNwn3i2qadxqvLH3kKzwum4aTlJKS56Wap969/oKkdFqVJUuV1SdrzZFahJ8y5qcUqr+oiucvE+eV8zUU62uis4zDTz4MPpUazXcX/VnXix5YznNN80otOrp+q6lnRe7p/MN6jfJzOT8TvlsamNSlKE7SnGTWbivvoN0zPXqfFP+pR/9Xj6nPTYR17lbpeTg8F0bepHmtRi3VVeB9NMSkviSn8OHM1FJNp4W/wCZfpHn4jRUlaqPK7ttZ9f3LOSYw9Hmk+R6cI9uba+1ehNTHVcA5uTc14quqeywPprG48GtPmlLl1G+jg8+WHhew+jF0+Dgo8tSdxSeKX5j6MePiFqw1OTT5uZ7JL9DU77Zvr06fAu9OU6bp8/d2nfXzRPpqRuXD6Tu4tKVP+rw48sUPpbHF8BpKUpdK/Dyt53xkv0z8u+noLUjLVmr1ndOKaqsKvkLeyPO+Wc4JpuXPGmsVF+J49W/Yb2v5rtGHLqTSqUWpJV/TVY+o0TU4eEXqScsySpVlSRB3en8NqcUoxmlSSz1vpXVFsSV4/4goSnKGko0qtZq7bb+o8PXDT4Rp+JLmvdtfkLyMep8I0k5OOdqUdvmRSOhFYUnL2i//sRWnw6i1zQvm/CuXL7vEvQqHI4SVRy80lLC7PxGePL6vRWEnOpJOk/xLm3vo3a3NeVPXng5x4u2uZ3vXt0/M1+H65cdpyetKXK4xbVdtixms6ek4trmaX/ED3cPoucbjqz2fhb+6M2tSO0dBad6slfKm3HlxJKySrWY8O9TVm5WoyinyvFda9ti03rG/wCS049KfkrXplMzpjnDgIxqm36/4L9GPRDhkoONum06Vb58vMaY6R0IL+he+SarXJD/AGQ+RA+HB/0R+SKjjq6PjhKEdruq7Es2Y1LjMNPSa8cY83dtZE6iV0WjpdlnzLqItKLnLm0010afz6idLe3ktdGYcxPoBL7q/UKvP60Bw4lv4acVm1TNcfUq8Jo/Dg3J5e/ZIcrqx2WppuvHntv+pMXptNYzfrSIrUnGKk5R6PuF1w0PFqpXHlWZPlS9tvujeZGZ3XuUFHaMUltRhpq8rDeelfLJQ+HB03p21dWk2XTHLitWWnpOUI8sr3pFndS9PBwfE6j4iNJNvEttsWaskZlr6k4xbd6cGnv1f5GNbw/00uXkVduR1+Q0cNLX+NqzjyR5dF1Hvbe/tT+Zu3qM/ruowzzLlV4yl+Rm2VqInpJ5cF/52ydDhxWpKLk9OlSjFYuln9mvdFS3Hm4LiXqa8dOVNSvp5NlvFJyr34lKcJPwL8Npbr8Tv3S9mT8X9eeXDN6+nTbi3Nyknm8tPy6FyRPXThNPTlpQk1Ukld1vSd+fcX1Z4kf4fp8q5ZNrvuTTCH8PhF23fqv2Lpjq+FTu+V3v4SapDQ5JNxxe9er6e/0GjvSrayDy8TpKPiXPmV+GVVu39WXTHaMmop5Sq85MqSpJvZK2xBjTnKceaKro1NZQsyputJ1+KSvyIrm5W8TSfmgjM9SUVVxYNqR1q3ign0vx1mouu6ZF0+P0z+f5hNYeo2+68wmuDuuuSspn7QCulr5AV56/QDHw03mr323LtG5K2rp1tasaLy5IKsAZa6XQ0ZWnWzeXnO5d1WlCur+bA1GPWs9yBGTisOvega38aUVXN88hdcNLn0+ZxlCN7vlN3lKm476erqtZ1PekZ1drf8xJdURdctOcoN8tLmbbXmzVqbXT4jv/APUv3IuusuIiqdMi65TnGSlFxlbVXgupsryaHw9Jp/CnPUrqsL0N27+szp6VxEW6egle7wYuNfTrLWtVFe7w/b5Ibow5NJSvPXxSf6/oNHfh9VzWRCO3MVUUgOerz/0ya+RBw+NqXvj2/Ympqy1XJU+mRpqfGklXN7UNNcOK15KG9JusFnaWvPwvESi1CLUYt7LH3sas/WZXt+JNqsNeZhra5/QA2+4QS8wFeYD8gHmBMLNlQcaRApAVUgI0ujAemfQCN3QFTaxfsBm6xsBfE1hMBy42ArboC8t7PAEX/bnzARi2tlfzA1VdArm3G6bz7/fUuUauCWJdeuBgcqau2/Qg5asqnW9K84x1z7fU3JLGXPQ1pymuzt7l5SYPVV97OTRf3QFWFYCe17+VZAujJxmuZYf0LKR7U7WLNNjAfeAOeppp338hg81NbozjKVfQBLSUlTfh6tMaY5x4GE8rUap9DX3T5jvLRUY/9S675M6Yi0b21IWDBaWcv3SYMWMEsNuXpgGCUf8Ac16ogwnG/L0CNJR7sDyfC1XvOvRs6bGVWnLaU5fMaNrTilt628GdVpNVtmgIBadXj26gOXCy2EJLt8gqfSgKua32QCS2trYDNqsKwjUXvigHMuXxfQitQmkv7/mJNHKcnKN1vhL6m5MFhGMfDjK3qngKvLVb/kS0dG3Wdl7GUefiFzJJSXMtrdUb49Dy8POMdXmlsrwv0N8psR6v5uP/AC/I5/BrcJc2bdPujNitQa75GCq2gLKLbu+vVAejS1cfits03K6p97+gVUqALGXkDE4qXmEeecOVbZJiYxB09rIkrfxIPLi79Quilp3bi/mDpVPSe0ZOulg2I9T/AGrHnkGi1L3SfzBrVxVyaS9AMw41PCcb84jD6berazXs/wC5DXl549129Waxhqnhx279AI/O7/MCyrtdPC8gIl5fSwKvSm+wGcvNXntgAt9r7+QGk6VUFOoGWl2zsBV+J28XgItJ1hvuBzepUeb+ml55LIOerJ9MN3V5VepqQIwd22q7pffn0Krtp6l4ukt7ymZvRrpV00vrgwJKNpqn+TASSUaulXR0XV1znwsZO25PHezX0y3HQjH8KW92+3lZnaNPz9iKkYq7qwLWLa+oEfWgLpy5b79DUWPbGVrFlbbu1W/sQZrzAjb8n7lGZRv16UEeaenTVYJiYw1+ZlEafQCO+uAhdAWwJJrZ9QPFlXtj9Dojrozd0+3R5JYOcuISdxqlhOs/3/z6G8DR1m9SMUtroWdD2W6STvbKRyBOn6ZAP09v7gSUn5ei/MoSp77gVyy00qr5gFHKzfv5hVe8cbAZvOav9Ait1eyXXyIM29++1fQomppxk/DJqT77/Mujl8NxfhksPu8F0dYxjHeSXplsWq38Rbbfp9TCNvFPq10W/mFG6ez2+voESUeW82n6UBiNvO/m2Bp+X5oDcmm15EVhOs3XnfUo0k+2f1IDf+AI+lYd2Fd9Gd+SednSfXob9aldG2nhhWnJ7kEU7SdfUosJWQSWnYHHU08O266PsExwdp0TGRY3YDoAbQGXFMI56mgpO02vQsuDjLhJvaSo19RMeOzoPTwOncubKrCruY5Ue1Ldpu85+/v0MK1DNdcbkRafk/LZ/eCjDTysK11AqtVX1d/QDOaV+wGZu3132soqhhrt+xBVF1nvnt9ADq2nsvIBvLDWNuiXcA14s9OwDwpVQEu2mkrA0urV+YG3aWN6yQOrbXt/b76hVk2s83XdgZaT6VlPCsIuMtO297WAHr6YCksLbZq8gRyfTFdEBp5umQFOl69gqRfK6zd2vU1xpHrUlKN18w2qmgCkvMDTaa3/ADAleYBwxn8wOU1Uaq12KjzKGLW3d9+xGVquhA/FS/QCNev6gVrqBnl7VYR8mEeaSjdX3OyPqwjGEFFO6Xp3OVuqjkqT/p79AJPWiqTlF56Z++pcRmXEQx+iHzRFxEbXRds/fQuUdlFNXfaOfvzMiOXNfR031AkJVT2V7Pb5FG+ZXa39vvYgymr/ALbAbfKsKkvn6gZg+W0o197AE045edlf0AfCTeU27VNASKeMKq+YFi7Wz9iDXMtr9bCsKazW+9MC8z5cpvG1YKiJ/XOdiDUV1ee/oBc1a33dARN1nHZpgSWatP78/cKmEr/IDcW3at+7Aw8bbvuB2hP5PKx169DbUdouluRpY1X9yBVMCqVboorkiBzYynQGZ6aeYlR5pQ8TUVt0JiWMqVbYIjeWBmSpgKV35Af/2Q==",
    shortDescription:
      "Colossal 13th-century chariot of the Sun God Surya carved in stone with 24 intricate wheels.",
    fullDescription:
      "Attributed to king Narasimhadeva I of the Eastern Ganga dynasty around 1250 CE. Designed in the shape of a gigantic ornamented chariot drawn by seven galloping stone horses, celebrated for extraordinary architectural geometry.",
    historicalInfo:
      'The 24 wheels function as precise sundials which can be used to calculate time accurately down to the minute. European sailors once called it the "Black Pagoda" due to its dark stone silhouette against the Bay of Bengal shore.',
    highlights: [
      "24 Geometrical Sundial Chariot Wheels",
      "Nata Mandir (Hall of Dance Sculptures)",
      "Seven Galloping Cosmic Chariot Horses",
      "High-relief Kalinga erotic and spiritual carvings",
    ],
    recommendedVisitDuration: "2 - 2.5 hours",
  },
  {
    id: "hampi",
    name: "Hampi Monuments & Virupaksha",
    location: "Vijayanagara, Karnataka",
    state: "Karnataka",
    coordinates: "15.3350° N, 76.4600° E",
    category: "Historical",
    crowdLevel: "LOW",
    crowdPercent: 32,
    estimatedWait: "8 min",
    currentQueue: 11,
    queueCapacity: 65,
    currentTicketNumber: 36,
    visitorCountToday: 1780,
    rating: 4.9,
    reviewsCount: 1120,
    visitingHours: "06:00 AM - 06:00 PM Daily",
    entryFee: "₹40 (Indian) / ₹600 (Foreign)",
    bestTime: "October to March; Sunset at Matanga Hill",
    imageUrl:
      "data:image/jpeg;base64,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",
    shortDescription:
      "Vast boulder-strewn landscape holding the capital ruins of the legendary Vijayanagara Empire.",
    fullDescription:
      "Hampi was the capital of the Vijayanagara Empire in the 14th century, described by chroniclers as one of the richest cities in the world. It features over 1,600 surviving monuments across 41 square kilometers alongside the Tungabhadra River.",
    historicalInfo:
      "Founded around 1336 by brothers Harihara I and Bukka Raya I, Hampi flourished as a mega trading hub for silk, gems, and Arabian horses until 1565. The iconic stone chariot in the Vittala complex is featured on the Indian ₹50 currency note.",
    highlights: [
      "Vittala Temple Stone Chariot & Musical Pillars",
      "Active Virupaksha Temple with 50m Gopuram",
      "Lotus Mahal and Elephant Stables",
      "Matanga Hill 360-degree sunset viewpoint",
    ],
    recommendedVisitDuration: "Full Day / 4 - 6 hours",
  },
  {
    id: "qutub-minar",
    name: "Qutub Minar Complex",
    location: "New Delhi, Delhi",
    state: "Delhi",
    coordinates: "28.5244° N, 77.1855° E",
    category: "Historical",
    crowdLevel: "MODERATE",
    crowdPercent: 65,
    estimatedWait: "20 min",
    currentQueue: 28,
    queueCapacity: 80,
    currentTicketNumber: 119,
    visitorCountToday: 3820,
    rating: 4.7,
    reviewsCount: 1200,
    visitingHours: "07:00 AM - 09:00 PM Daily",
    entryFee: "₹35 (Indian) / ₹550 (Foreign)",
    bestTime: "Late afternoon (04:00 PM) for illuminated night tours",
    imageUrl:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "72.5-metre red sandstone victory tower with fluted minarets and ancient Sanskrit iron pillar.",
    fullDescription:
      "Built from 1199 CE by Qutb-ud-din Aibak and completed by his successor Iltutmish. The complex houses the mysterious 4th-century rust-resistant Iron Pillar of Chandragupta II and Quwwat-ul-Islam Mosque.",
    historicalInfo:
      "The tower has five distinct storeys, each marked by a projecting balcony supported by subtle honeycomb brackets. It combines Afghan minaret engineering with local Indian stone carving techniques.",
    highlights: [
      "72.5m Fluted Sandstone Victory Minaret",
      "1,600-year-old Rustless Iron Pillar",
      "Alai Darwaza red marble southern gateway",
      "Tomb of Sultan Iltutmish",
    ],
    recommendedVisitDuration: "1.5 - 2 hours",
  },
  {
    id: "meenakshi-temple",
    name: "Meenakshi Amman Temple",
    location: "Madurai, Tamil Nadu",
    state: "Tamil Nadu",
    coordinates: "9.9195° N, 78.1193° E",
    category: "Cultural",
    crowdLevel: "HIGH",
    crowdPercent: 86,
    estimatedWait: "30 min",
    currentQueue: 39,
    queueCapacity: 85,
    currentTicketNumber: 175,
    visitorCountToday: 6200,
    rating: 4.9,
    reviewsCount: 1600,
    visitingHours: "05:00 AM - 12:30 PM & 04:00 PM - 10:00 PM",
    entryFee: "Free General Entry / Special Darshan Passes Available",
    bestTime: "Evening (06:30 PM) for the night palanquin procession",
    imageUrl:
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "Dravidian architectural wonder featuring 14 soaring gateway towers adorned with thousands of colorful mythological figures.",
    fullDescription:
      "Located on the southern bank of the Vaigai River in Madurai, dedicated to Goddess Meenakshi (Parvati) and Sundareswarar (Shiva). The heart of the 2,500-year-old city designed around the temple in concentric lotus-petal streets.",
    historicalInfo:
      "Rebuilt and expanded in the 16th and 17th centuries by the Nayak dynasty under King Thirumalai Nayak. The complex boasts 14 gopurams (gateway towers), the tallest reaching 51.9 metres, and the Hall of 1000 Pillars.",
    highlights: [
      "Hall of a Thousand Carved Pillars",
      "Golden Lotus Sacred Water Tank (Porthamarai Kulam)",
      "14 Multi-Tiered Sculpted Rainbow Gopurams",
      "Nightly Celestial Palanquin Ceremony",
    ],
    recommendedVisitDuration: "2 - 3 hours",
  },
];

export const CATEGORIES = [
  "All",
  "Low Crowd",
  "Moderate",
  "High",
  "Heritage",
  "Spiritual",
  "Beach",
  "Nature",
];

export const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Lowest Wait", value: "wait-asc" },
  { label: "Least Crowded", value: "crowd-asc" },
  { label: "Most Popular", value: "popularity-desc" },
];
