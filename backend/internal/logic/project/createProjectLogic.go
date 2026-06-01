package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateProjectLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreateProjectLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateProjectLogic {
	return &CreateProjectLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateProjectLogic) CreateProject(req *types.CreateProjectReq) (resp *types.ProjectResp, err error) {
	if err = perm.RequireAdmin(l.ctx); err != nil {
		return nil, err
	}
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}

	tx, err := l.svcCtx.DB.BeginTx(l.ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var p types.ProjectResp
	err = tx.QueryRowContext(l.ctx, `
		INSERT INTO projects (workspace_id, code, name, type, description, start_date, end_date, pm_id, bonus_pool)
		VALUES (NULLIF($1,'')::uuid, $2, $3, $4, $5, $6::date, $7::date, $8::uuid, $9)
		RETURNING id, code, name, type, status, rag_status, rag_override, progress,
		          start_date, end_date, pm_id, bonus_pool, created_at`,
		req.WorkspaceId, req.Code, req.Name, req.Type, req.Description,
		req.StartDate, req.EndDate, userID, req.BonusPool,
	).Scan(&p.Id, &p.Code, &p.Name, &p.Type, &p.Status, &p.RagStatus, &p.RagOverride,
		&p.Progress, &p.StartDate, &p.EndDate, &p.PmId, &p.BonusPool, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	_, err = tx.ExecContext(l.ctx, `
		INSERT INTO project_members (project_id, user_id, role)
		VALUES ($1, $2, 'pm')`, p.Id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to add pm member: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit: %w", err)
	}
	p.WorkspaceId = req.WorkspaceId
	return &p, nil
}
