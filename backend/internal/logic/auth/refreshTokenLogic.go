package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type RefreshTokenLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
	r      *http.Request
}

func NewRefreshTokenLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RefreshTokenLogic {
	return &RefreshTokenLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func NewRefreshTokenLogicWithReq(ctx context.Context, svcCtx *svc.ServiceContext, r *http.Request) *RefreshTokenLogic {
	return &RefreshTokenLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx, r: r}
}

func (l *RefreshTokenLogic) RefreshToken() (resp *types.LoginResp, err error) {
	if l.r == nil {
		return nil, fmt.Errorf("unauthenticated")
	}
	authHeader := l.r.Header.Get("Authorization")
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenStr == "" {
		return nil, fmt.Errorf("unauthenticated")
	}
	claims := jwt.MapClaims{}
	_, err = jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(l.svcCtx.Config.Auth.AccessSecret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("unauthenticated")
	}
	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		return nil, fmt.Errorf("unauthenticated")
	}
	var user types.UserInfo
	err = l.svcCtx.DB.QueryRowContext(l.ctx,
		`SELECT id, username, full_name, email, system_role, COALESCE(avatar_url,'') FROM users WHERE id=$1`, userID,
	).Scan(&user.Id, &user.Username, &user.FullName, &user.Email, &user.Role, &user.Avatar)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}
	expire := l.svcCtx.Config.Auth.AccessExpire
	expiresAt := time.Now().Unix() + expire
	newClaims := jwt.MapClaims{"sub": user.Id, "role": user.Role, "exp": expiresAt, "iat": time.Now().Unix()}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, newClaims)
	newToken, signErr := token.SignedString([]byte(l.svcCtx.Config.Auth.AccessSecret))
	if signErr != nil {
		return nil, fmt.Errorf("failed to generate token")
	}
	return &types.LoginResp{Token: newToken, ExpiresAt: expiresAt, User: user}, nil
}
