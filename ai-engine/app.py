from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app) 

def classify_grievance(text):
    text_lower = text.lower()
    
    # 1. Water Supply & Drainage
    water_keywords = [
        "water", "pipe", "leak", "drain", "pani", "drainage", "sewage", "gutter", "gatar", 
        "block", "clog", "overflow", "tap", "no water", "drinking water", "pipeline", 
        "valve", "pressure", "tank", "pump", "muddy water", "contaminated", "stinking water", 
        "jal", "nala", "nullah", "sewer", "manhole", "open drain", "storm water", "flooding", 
        "waterlogging", "line burst", "motor", "borewell", "supply cut", "tanker", "leakages", 
        "impure", "dirty water", "jalboard", "plumbing", "main line", "drip", "seeping", 
        "sanitation", "choke", "choked", "stagnant"
    ]
    
    # 2. Public Works (PWD) / Roads
    pwd_keywords = [
        "road", "pothole", "bridge", "rasta", "khatara", "tar", "asphalt", "cement road", 
        "broken", "crack", "repair", "construction", "speed breaker", "pavement", "sidewalk", 
        "footpath repair", "divider", "flyover", "underpass", "highway", "street", "lane", 
        "sadak", "khadda", "digging", "dug up", "uneven", "mud road", "gravel", "barricade", 
        "maintenance", "resurfacing", "damage", "damaged road", "paver blocks", "rubble", 
        "contractor", "road widening", "bypass", "ring road", "traffic hazard", "crater", 
        "caved in", "sinkhole", "patching", "potholed", "rut", "debris"
    ]
    
    # 3. Solid Waste Management
    waste_keywords = [
        "garbage", "waste", "trash", "kachra", "sweep", "dustbin", "dumping", "smell", 
        "stench", "stink", "foul smell", "kachrapeti", "kachra gadi", "sweeper", "safai", 
        "ghanta gadi", "solid waste", "rotten", "litter", "uncollected", "overflowing bin", 
        "dumpyard", "garbage truck", "plastic waste", "biowaste", "medical waste", "disposal", 
        "recycle", "compost", "wet waste", "dry waste", "segregation", "filth", "filthy", 
        "unclean", "garbage burning", "smoke from garbage", "landfill", "swachh", "sanitary", 
        "garbage pile", "kuda", "kura", "kude", "cleaning", "spitting"
    ]
    
    # 4. Public Health & Animal Control
    health_keywords = [
        "mosquito", "dengue", "stray", "dog", "dead animal", "hospital", "health", "malaria", 
        "chikungunya", "fever", "clinic", "dispensary", "doctor", "medicine", "pharmacy", 
        "stray dogs", "kutta", "rabid", "bites", "pest control", "fumigation", "fogging", 
        "rats", "rodent", "stray pigs", "animal carcass", "hygiene", "outbreak", "epidemic", 
        "virus", "vaccination", "public toilet", "sulabh", "toilet cleaning", "unhygienic", 
        "sanitary napkin", "biomedical", "ambulance", "casualty", "ward", "bed bug", "fleas", 
        "ticks", "stray menace", "pig menace", "slaughterhouse", "food poisoning", "adulteration"
    ]
    
    # 5. Anti-Encroachment
    encroachment_keywords = [
        "illegal", "encroachment", "stall", "unauthorized", "footpath", "tapri", "hawkers", 
        "vendor", "thela", "pathari", "slum", "hut", "zopadpatti", "illegal construction", 
        "without permission", "blocking", "blocked road", "capturing", "capture", "illegal parking", 
        "abandoned vehicle", "squatters", "tin shed", "illegal shop", "demolition", "anti-encroachment", 
        "unauthorized board", "hoarding", "illegal banner", "flex", "political banner", "poster", 
        "occupying", "occupied", "eviction", "notice", "building violation", "margin space", 
        "front margin", "illegal extension", "balcony extension", "roof extension", "boundary wall", 
        "trespassing", "atikraman", "bekaydeshir"
    ]
    
    # 6. Parks, Gardens & Tree Authority
    parks_keywords = [
        "tree", "branch", "park", "garden", "grass", "ped", "falling tree", "fallen tree", 
        "dry tree", "trimming", "pruning", "cutting", "dangerous tree", "playground", 
        "kids play area", "swings", "slide", "bench", "walking track", "jogging track", 
        "lawn", "bushes", "overgrown", "landscaping", "watering", "bageecha", "udyan", 
        "maidan", "open space", "weed", "plantation", "sapling", "green cover", "uprooted", 
        "heavy branch", "hanging branch", "tree guard", "park light", "park gate", 
        "security guard park", "maintenance of garden", "broken equipment", "exercise equipment", 
        "green waste", "dried leaves", "horticulture", "flora"
    ]
    
    # 7. Property Tax & Revenue
    tax_keywords = [
        "tax", "property", "payment", "receipt", "bill", "assessment", "rate", "milkat kar", 
        "property tax", "online payment", "failure", "penalty", "interest", "overdue", "notice", 
        "refund", "double payment", "transaction failed", "update name", "transfer property", 
        "mutation", "name change", "address change", "tax calculation", "wrong bill", "overcharged", 
        "arrear", "ptax", "municipal tax", "commercial tax", "residential tax", "non-taxable", 
        "discount", "rebate", "concession", "tax receipt not generated", "payment gateway", 
        "challan", "ward office tax", "property id", "index number", "assessment book", "milkat", 
        "house tax", "property register"
    ]
    
    # 8. Electrical & Street Lighting
    electrical_keywords = [
        "light", "electricity", "pole", "bijli", "wire", "streetlight", "street light", "dark", 
        "blackout", "power cut", "sparking", "short circuit", "transformer", "bulb", "tube light", 
        "led", "glowing", "not glowing", "fuse", "meter", "live wire", "hanging wire", "broken wire", 
        "electric shock", "shock hazard", "faulty", "flashing", "blinking", "timer", "daytime lights on", 
        "distribution box", "dp box", "open junction", "underground cable", "current", "voltage", 
        "fluctuation", "panel board", "switch", "street lighting", "dark patch", "unlit", 
        "illumination", "lamp post", "mast light", "high mast", "floodlight"
    ]

    # Classification Logic
    if any(word in text_lower for word in water_keywords):
        return {"department": "Water Supply & Drainage", "urgency": "High"}
    elif any(word in text_lower for word in pwd_keywords):
        return {"department": "Public Works (PWD)", "urgency": "Medium"}
    elif any(word in text_lower for word in waste_keywords):
        return {"department": "Solid Waste Management", "urgency": "High"}
    elif any(word in text_lower for word in electrical_keywords):
        return {"department": "Electrical Department", "urgency": "High"}
    elif any(word in text_lower for word in health_keywords):
        return {"department": "Public Health", "urgency": "High"}
    elif any(word in text_lower for word in encroachment_keywords):
        return {"department": "Encroachment", "urgency": "Medium"}
    elif any(word in text_lower for word in parks_keywords):
        return {"department": "Parks & Gardens", "urgency": "Low"}
    elif any(word in text_lower for word in tax_keywords):
        return {"department": "Property Tax", "urgency": "Low"}
    else:
        return {"department": "General Administration", "urgency": "Low"}

@app.route('/predict', methods=['POST'])
def predict_grievance():
    try:
        data = request.json
        text = data.get('text', '')
        
        # Call the classification function
        result = classify_grievance(text)
        
        return jsonify({
            "department": result["department"],
            "urgency": result["urgency"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)