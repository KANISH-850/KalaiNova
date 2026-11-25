from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.system import ModelMetadata


class ModelRegistry:
    """In-memory + DB-backed registry for all AI/ML models used in KALAINOVA."""

    _statuses: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def update_status(cls, model_name: str, status: str, notes: str = "", db: Session | None = None) -> None:
        cls._statuses[model_name] = {"loading_status": status, "notes": notes}
        if db is not None:
            row = db.query(ModelMetadata).filter(ModelMetadata.model_name == model_name).first()
            if row:
                row.loading_status = status
                if notes:
                    row.notes = notes
                db.commit()

    @classmethod
    def get_all(cls, db: Session) -> list[dict]:
        rows = db.query(ModelMetadata).order_by(ModelMetadata.id.asc()).all()
        result = []
        for r in rows:
            override = cls._statuses.get(r.model_name)
            result.append({
                "id": r.id,
                "model_name": r.model_name,
                "model_version": r.model_version,
                "source": r.source,
                "license": r.license,
                "task": r.task,
                "input_format": r.input_format,
                "output_format": r.output_format,
                "hardware_requirements": r.hardware_requirements,
                "loading_status": override["loading_status"] if override else r.loading_status,
                "notes": (override["notes"] if override and override["notes"] else r.notes),
            })
        return result
