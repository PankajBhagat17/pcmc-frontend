def classify_grievance(text):
    text_lower = text.lower()
    
    if any(word in text_lower for word in ["water", "pipe", "leak", "drain", "pani"]):
        return {"department": "Water Supply & Drainage", "urgency": "High"}
    elif any(word in text_lower for word in ["road", "pothole", "bridge", "rasta", "khatara"]):
        return {"department": "Public Works (PWD)", "urgency": "Medium"}
    elif any(word in text_lower for word in ["garbage", "waste", "trash", "kachra", "sweep", "dustbin"]):
        return {"department": "Solid Waste Management", "urgency": "High"}
    elif any(word in text_lower for word in ["mosquito", "dengue", "stray", "dog", "dead animal", "hospital", "health"]):
        return {"department": "Public Health", "urgency": "High"}
    elif any(word in text_lower for word in ["illegal", "encroachment", "stall", "unauthorized", "footpath"]):
        return {"department": "Encroachment", "urgency": "Medium"}
    elif any(word in text_lower for word in ["tree", "branch", "park", "garden", "grass", "ped"]):
        return {"department": "Parks & Gardens", "urgency": "Low"}
    elif any(word in text_lower for word in ["tax", "property", "payment", "receipt"]):
        return {"department": "Property Tax", "urgency": "Low"}
    elif any(word in text_lower for word in ["light", "electricity", "pole", "bijli", "wire"]):
        return {"department": "Electrical Department", "urgency": "High"}
    else:
        return {"department": "General Administration", "urgency": "Low"}