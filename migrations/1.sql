
CREATE TABLE containers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  container_number TEXT NOT NULL,
  departure_port TEXT NOT NULL,
  arrival_port TEXT NOT NULL,
  departure_date DATETIME,
  expected_arrival_date DATETIME,
  actual_arrival_date DATETIME,
  status TEXT NOT NULL DEFAULT 'pending',
  cargo_description TEXT,
  tracking_number TEXT,
  shipping_line TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_containers_user_id ON containers(user_id);
CREATE INDEX idx_containers_status ON containers(status);
CREATE INDEX idx_containers_expected_arrival ON containers(expected_arrival_date);
