from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.orchestrator import run_agent
from app.api.deps import get_current_user
from app.database.session import get_db
from app.models import User
from app.schemas.marketplace_finance import AgentQueryRequest

router = APIRouter(prefix="/agents", tags=["Agentic AI"])

VALID_AGENTS = {"catalog", "pricing", "finance", "market-intelligence", "business-growth"}


@router.post("/{agent_type}")
async def invoke_agent(
    agent_type: str,
    payload: AgentQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if agent_type not in VALID_AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found")
    return await run_agent(
        db=db,
        user=current_user,
        agent_type=agent_type,
        message=payload.message,
        product_id=payload.product_id,
        confirm_action_id=payload.confirm_action_id,
    )
