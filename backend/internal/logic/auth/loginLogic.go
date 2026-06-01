// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"
	"golang.org/x/crypto/bcrypt"

	"github.com/zeromicro/go-zero/core/logx"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginReq) (resp *types.LoginResp, err error) {
	var user types.UserInfo
	var passwordHash string

	row := l.svcCtx.DB.QueryRowContext(l.ctx,
		`SELECT id, username, full_name, email, COALESCE(phone,''), system_role, COALESCE(avatar_url,''), password_hash
		 FROM users WHERE username = $1 AND is_active = true`, req.Username)

	err = row.Scan(&user.Id, &user.Username, &user.FullName, &user.Email,
		&user.Phone, &user.Role, &user.Avatar, &passwordHash)
	if err != nil {
		return nil, fmt.Errorf("invalid username or password")
	}

	if err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid username or password")
	}

	expire := l.svcCtx.Config.Auth.AccessExpire
	expiresAt := time.Now().Unix() + expire

	claims := jwt.MapClaims{
		"sub":  user.Id,
		"role": user.Role,
		"exp":  expiresAt,
		"iat":  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(l.svcCtx.Config.Auth.AccessSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to generate token")
	}

	return &types.LoginResp{
		Token:     tokenStr,
		ExpiresAt: expiresAt,
		User:      user,
	}, nil
}
