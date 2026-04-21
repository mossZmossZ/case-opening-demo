# Phase 4: Kubernetes + Full Observability

## Goal
Production-grade deployment on Kubernetes with Istio service mesh, distributed tracing, and monitoring dashboards.

## K8s Manifests Structure
```
k8s/
├── namespace.yaml
├── base/
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── auth-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── game-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── admin-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── prize-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── mongodb/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   ├── redis/
│   │   ├── statefulset.yaml
│   │   ├── service.yaml
│   │   └── pvc.yaml
│   └── config/
│       ├── configmap.yaml
│       └── secrets.yaml
├── istio/
│   ├── gateway.yaml
│   ├── virtual-service.yaml
│   ├── destination-rules.yaml
│   └── peer-authentication.yaml   # mTLS strict
├── observability/
│   ├── jaeger.yaml
│   ├── kiali.yaml
│   ├── prometheus/
│   │   ├── prometheus.yaml
│   │   └── service-monitors.yaml
│   └── grafana/
│       ├── grafana.yaml
│       └── dashboards/
│           └── zenith-dashboard.json
└── kustomization.yaml
```

## Istio Configuration

### Gateway
- Host: `zenith.local` (or configurable)
- Port 80 → routes to VirtualService

### VirtualService Routes
```
/                 → frontend (port 80)
/api/auth/*       → auth-service (port 4001)
/api/game/*       → game-service (port 4002)
/api/admin/*      → admin-service (port 4003)
/api/prizes/*     → prize-service (port 4004)
```

### mTLS
- PeerAuthentication: STRICT mode on `zenith-case` namespace
- All inter-service traffic encrypted via Envoy sidecars

## HPA (Horizontal Pod Autoscaler)

| Service | Min | Max | Target CPU |
|---------|-----|-----|-----------|
| frontend | 2 | 5 | 70% |
| game-service | 2 | 10 | 60% |
| prize-service | 2 | 8 | 60% |
| auth-service | 1 | 4 | 70% |

## Observability

### Jaeger (Distributed Tracing)
- Traces full request path: frontend → nginx → game-service → prize-service → MongoDB
- View latency breakdown per service hop
- Access: `http://jaeger.zenith.local:16686`

### Kiali (Service Mesh Dashboard)
- Visualize service graph with real-time traffic flow
- Identify failing routes, error rates per edge
- Access: `http://kiali.zenith.local:20001`

### Prometheus + Grafana
- Metrics scraped from Istio Envoy sidecars + custom app metrics
- Dashboard panels:
  - Request rate (req/s) per service
  - Latency percentiles (p50, p95, p99)
  - Error rate (4xx, 5xx)
  - Spin throughput (spins/min)
  - Prize stock levels
  - Active sessions gauge
- Access: `http://grafana.zenith.local:3000`

## Probes

All services must implement:
```
GET /healthz      → 200 (liveness)
GET /readyz       → 200 when DB connected (readiness)
```

## Resource Limits (per pod)

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|------------|-----------|---------------|-------------|
| frontend | 100m | 200m | 128Mi | 256Mi |
| auth | 100m | 300m | 128Mi | 256Mi |
| game | 200m | 500m | 256Mi | 512Mi |
| admin | 100m | 300m | 128Mi | 256Mi |
| prize | 200m | 500m | 256Mi | 512Mi |
| mongodb | 500m | 1000m | 512Mi | 1Gi |
| redis | 100m | 300m | 128Mi | 256Mi |

## Deployment Commands
```bash
# Create namespace with Istio injection
kubectl create namespace zenith-case
kubectl label namespace zenith-case istio-injection=enabled

# Deploy everything
kubectl apply -k k8s/

# Verify
kubectl get pods -n zenith-case
kubectl get svc -n zenith-case
istioctl analyze -n zenith-case
```

## Done When
- [ ] All pods running and healthy in `zenith-case` namespace
- [ ] App accessible via Istio Ingress Gateway
- [ ] mTLS verified: `istioctl authn tls-check` shows STRICT
- [ ] Jaeger shows traces across all services for a spin request
- [ ] Kiali shows service graph with green edges (healthy traffic)
- [ ] Grafana dashboard shows real-time metrics
- [ ] HPA scales game-service under synthetic load
- [ ] Pod restart doesn't lose MongoDB/Redis data (PVC verified)
