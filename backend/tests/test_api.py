from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["app"] == "ContractLens"

def test_get_contracts():
    res = client.get("/api/contracts")
    assert res.status_code == 200
    contracts = res.json()
    assert len(contracts) > 0
    assert any("ACME Software Agreement" in c["title"] for c in contracts)

def test_get_contract_detail():
    res = client.get("/api/contracts/contract_acme_msa")
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == "contract_acme_msa"
    assert len(detail["clauses"]) >= 40
    assert len(detail["obligations"]) >= 15
    assert len(detail["deadlines"]) >= 7
    assert len(detail["version_changes"]) >= 4

def test_dashboard_metrics():
    res = client.get("/api/analytics/dashboard")
    assert res.status_code == 200
    metrics = res.json()
    assert metrics["active_contracts"] >= 24
    assert metrics["upcoming_deadlines"] >= 8
    assert metrics["review_required"] >= 5
    assert metrics["renewals_approaching"] >= 3

def test_ask_contractlens_query():
    res = client.post("/api/query", json={"query": "What do we need to do in the next 30 days?"})
    assert res.status_code == 200
    data = res.json()
    assert "require" in data["answer"] and "attention" in data["answer"]
    assert len(data["related_obligations"]) > 0
    assert len(data["sources"]) > 0

def test_contract_graph():
    res = client.get("/api/graph/contract_acme_msa")
    assert res.status_code == 200
    graph = res.json()
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

def test_review_action_workflow():
    # Test Confirm action on rev_001
    res = client.post(
        "/api/reviews/rev_001/action",
        json={"action": "CONFIRM", "resolution_notes": "Reviewed and confirmed 90-day renewal deadline."}
    )
    assert res.status_code == 200
    rv = res.json()
    assert rv["status"] == "CONFIRMED"
