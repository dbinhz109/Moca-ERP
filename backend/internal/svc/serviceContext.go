// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package svc

import (
	"database/sql"
	"fmt"

	"github.com/mocatech/erp/internal/config"
	"github.com/mocatech/erp/internal/middleware"
	_ "github.com/lib/pq"
	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Config  config.Config
	DB      *sql.DB
	JwtAuth rest.Middleware
}

func NewServiceContext(c config.Config) *ServiceContext {
	db, err := sql.Open("postgres", c.DB.DataSource)
	if err != nil {
		panic(fmt.Sprintf("failed to connect to postgres: %v", err))
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return &ServiceContext{
		Config:  c,
		DB:      db,
		JwtAuth: middleware.NewJwtAuthMiddleware(c.Auth.AccessSecret).Handle,
	}
}
