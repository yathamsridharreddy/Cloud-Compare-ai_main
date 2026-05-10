from sqlalchemy import Column, Integer, String, Float
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

class CloudService(Base):
    __tablename__ = "cloud_services"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)
    service_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    cpu = Column(Integer, nullable=False)
    ram = Column(Integer, nullable=False)
    storage = Column(Integer, nullable=False)
    price_per_hour = Column(Float, nullable=False)
    price_per_gb = Column(Float, nullable=False)
    performance_score = Column(Float, nullable=False)
    popularity_score = Column(Float, nullable=False)
    region = Column(String(50), nullable=False)
    description = Column(String(500))
