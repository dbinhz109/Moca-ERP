package ctxutil

import (
	"context"
	"errors"
)

type contextKey string

const userIDKey contextKey = "userId"
const userRoleKey contextKey = "userRole"

var ErrUnauthenticated = errors.New("unauthenticated")

func WithUserID(ctx context.Context, userID, role string) context.Context {
	ctx = context.WithValue(ctx, userIDKey, userID)
	return context.WithValue(ctx, userRoleKey, role)
}

func UserIDFromCtx(ctx context.Context) (string, error) {
	id, ok := ctx.Value(userIDKey).(string)
	if !ok || id == "" {
		return "", ErrUnauthenticated
	}
	return id, nil
}

func UserRoleFromCtx(ctx context.Context) string {
	role, _ := ctx.Value(userRoleKey).(string)
	return role
}
