ALTER TABLE reviews ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_reviews_deleted ON reviews(deleted);