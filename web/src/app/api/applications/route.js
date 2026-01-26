import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import {
  createApplicationReceivedEmail,
  createAdminApplicationNotificationEmail,
  createApplicationStatusEmail,
} from "@/app/api/utils/email-templates";

export const POST = async (request) => {
  try {
    const {
      userId,
      artistStatement,
      portfolio,
      resume,
      letterOfIntent,
      references,
      userEmail,
      userName,
      artStyle,
      focusWorkGoals,
      whyUbuntu,
      cvFileUrl,
      showReelUrl,
      applicationType = "artist_residency",
    } = await request.json();

    // Validate required fields
    if (
      !userId ||
      !artistStatement ||
      !portfolio ||
      !resume ||
      !letterOfIntent ||
      !references ||
      !artStyle ||
      !focusWorkGoals ||
      !whyUbuntu
    ) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if user already has a pending or approved application
    const existingApplications = await sql`
      SELECT id, status FROM applications
      WHERE user_id = ${userId}
      AND status IN ('pending', 'approved')
      AND application_type = ${applicationType}
    `;

    if (existingApplications.length > 0) {
      return Response.json(
        { error: "You already have an active application" },
        { status: 400 },
      );
    }

    // Insert application into database
    const [application] = await sql`
      INSERT INTO applications (
        user_id,
        user_name,
        user_email,
        artist_statement,
        portfolio,
        resume,
        letter_of_intent,
        references_info,
        art_style,
        focus_work_goals,
        why_ubuntu,
        cv_file_url,
        show_reel_url,
        application_type,
        status
      ) VALUES (
        ${userId},
        ${userName},
        ${userEmail},
        ${artistStatement},
        ${portfolio},
        ${resume},
        ${letterOfIntent},
        ${references},
        ${artStyle},
        ${focusWorkGoals},
        ${whyUbuntu},
        ${cvFileUrl || null},
        ${showReelUrl || null},
        ${applicationType},
        'pending'
      )
      RETURNING *
    `;

    // Send email notifications
    try {
      // Send confirmation email to applicant
      if (userEmail) {
        const confirmationEmail = createApplicationReceivedEmail(application);

        await sendEmail({
          to: userEmail,
          from: "applications@ubuntuartvillage.com",
          subject: "Application Received - Ubuntu Art Village",
          html: confirmationEmail.html,
          text: confirmationEmail.text,
        });
        console.log(`Application confirmation email sent to ${userEmail}`);
      }

      // Send notification email to admin
      const adminEmail =
        process.env.ADMIN_EMAIL || "admin@ubuntuartvillage.com";
      const adminNotification =
        createAdminApplicationNotificationEmail(application);

      await sendEmail({
        to: adminEmail,
        from: "notifications@ubuntuartvillage.com",
        subject: `New Artist Application - ${userName || userEmail} (#${application.id})`,
        html: adminNotification.html,
        text: adminNotification.text,
      });
      console.log(
        `Admin notification email sent for application #${application.id}`,
      );
    } catch (emailError) {
      // Log email error but don't fail the application submission
      console.error("Failed to send application emails:", emailError);
      // Application is still created successfully even if emails fail
    }

    return Response.json({
      success: true,
      application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return Response.json(
      { error: "Failed to submit application" },
      { status: 500 },
    );
  }
};

export const GET = async (request) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");
    const userId = url.searchParams.get("userId");
    const userRole = url.searchParams.get("userRole");

    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email
      FROM applications a
      LEFT JOIN auth_users u ON a.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // If not admin, filter by user ID
    if (userRole !== "admin" && userId) {
      query += ` AND a.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY a.submitted_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const applications = await sql(query, params);

    // Get total count with same filters
    let countQuery = "SELECT COUNT(*) as total FROM applications WHERE 1=1";
    const countParams = [];
    let countParamIndex = 1;

    if (userRole !== "admin" && userId) {
      countQuery += ` AND user_id = $${countParamIndex}`;
      countParams.push(userId);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const [{ total }] = await sql(countQuery, countParams);

    return Response.json({
      applications,
      total: parseInt(total),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return Response.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
};

export const PUT = async (request) => {
  try {
    const {
      id,
      status,
      reviewerNotes,
      artistStatement,
      portfolio,
      resume,
      letterOfIntent,
      references,
      artStyle,
      focusWorkGoals,
      whyUbuntu,
      cvFileUrl,
      showReelUrl,
    } = await request.json();

    if (!id) {
      return Response.json(
        { error: "Application ID is required" },
        { status: 400 },
      );
    }

    // Build update data object
    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      updateData.reviewed_at = "CURRENT_TIMESTAMP";
    }
    if (reviewerNotes !== undefined) updateData.reviewer_notes = reviewerNotes;
    if (artistStatement !== undefined)
      updateData.artist_statement = artistStatement;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (resume !== undefined) updateData.resume = resume;
    if (letterOfIntent !== undefined)
      updateData.letter_of_intent = letterOfIntent;
    if (references !== undefined) updateData.references_info = references;
    if (artStyle !== undefined) updateData.art_style = artStyle;
    if (focusWorkGoals !== undefined)
      updateData.focus_work_goals = focusWorkGoals;
    if (whyUbuntu !== undefined) updateData.why_ubuntu = whyUbuntu;
    if (cvFileUrl !== undefined) updateData.cv_file_url = cvFileUrl;
    if (showReelUrl !== undefined) updateData.show_reel_url = showReelUrl;

    // Create SET clause for SQL
    const setClauses = [];
    const values = [id];
    let paramIndex = 2;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value === "CURRENT_TIMESTAMP") {
        setClauses.push(`${key} = CURRENT_TIMESTAMP`);
      } else {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateQuery = `
      UPDATE applications 
      SET ${setClauses.join(", ")}
      WHERE id = $1 
      RETURNING *
    `;

    const [updatedApplication] = await sql(updateQuery, values);

    // Send status update email to applicant
    try {
      if (
        updatedApplication.user_email &&
        status &&
        (status === "approved" || status === "rejected")
      ) {
        const statusEmail = createApplicationStatusEmail(
          updatedApplication,
          status,
          reviewerNotes,
        );

        await sendEmail({
          to: updatedApplication.user_email,
          from: "applications@ubuntuartvillage.com",
          subject: `Application ${status === "approved" ? "Approved" : "Update"} - Ubuntu Art Village`,
          html: statusEmail.html,
          text: statusEmail.text,
        });
        console.log(
          `Application status email sent to ${updatedApplication.user_email}`,
        );
      }
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Update is still successful even if email fails
    }

    return Response.json({
      success: true,
      application: updatedApplication,
      message: "Application updated successfully",
    });
  } catch (error) {
    console.error("Applications PUT error:", error);
    return Response.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
};
